using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MQTTnet;
using MQTTnet.Client;
using System.Collections.Concurrent;
using System.Text;
using IoTWebApp.Hubs;
using Microsoft.AspNetCore.SignalR;
using IoTWebApp.Configuration;
using Microsoft.Extensions.Options;
using MQTTnet.Protocol;

var builder = WebApplication.CreateBuilder(args);

// Thêm các dịch vụ vào container
builder.Services.AddRazorPages();
builder.Services.AddControllers();

// Cấu hình CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policyBuilder =>
    {
        policyBuilder.AllowAnyOrigin()
                     .AllowAnyMethod()
                     .AllowAnyHeader();
    });
});

// Thêm SignalR
builder.Services.AddSignalR();

// Đọc cấu hình MQTT từ appsettings.json
builder.Services.Configure<MqttSettings>(builder.Configuration.GetSection("Mqtt"));
var mqttSettings = builder.Configuration.GetSection("Mqtt").Get<MqttSettings>();

// Tạo và cấu hình MQTT client
var mqttFactory = new MqttFactory();
var mqttClient = mqttFactory.CreateMqttClient();

// Cấu hình MQTT Client Options từ MqttSettings
var mqttOptions = new MqttClientOptionsBuilder()
    .WithClientId(mqttSettings.ClientId)
    .WithTcpServer(mqttSettings.Broker, mqttSettings.Port)
    .WithCredentials(mqttSettings.Username, mqttSettings.Password)
    .WithCleanSession()
    .WithTls()
    .Build();

// Kết nối tới MQTT broker
async Task ConnectMqttAsync()
{
    try
    {
        await mqttClient.ConnectAsync(mqttOptions, CancellationToken.None);
        Console.WriteLine("Đã kết nối thành công tới MQTT broker.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"### KẾT NỐI THẤT BẠI ###\n{ex.Message}");
    }
}

await ConnectMqttAsync();

// Đăng ký vào các topics
var topicFilter = new MqttTopicFilterBuilder()
    .WithTopic(mqttSettings.SubscribeTopic)
    .WithQualityOfServiceLevel(MqttQualityOfServiceLevel.ExactlyOnce)
    .Build();

await mqttClient.SubscribeAsync(topicFilter);
Console.WriteLine($"Đã đăng ký vào topic '{mqttSettings.SubscribeTopic}'");

// Khởi tạo lưu trữ tin nhắn
var receivedMessages = new ConcurrentBag<string>();
builder.Services.AddSingleton(receivedMessages); // Registering as ConcurrentBag<string>

// Đăng ký MQTT Client
builder.Services.AddSingleton<IMqttClient>(mqttClient);

// Xây dựng ứng dụng
var app = builder.Build();

// Sử dụng CORS
app.UseCors("AllowAllOrigins");

// Cấu hình pipeline xử lý HTTP request
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

// Đăng ký các endpoint
app.MapRazorPages();
app.MapControllers();
app.MapHub<MqttHub>("/mqttHub");

// Xử lý nhận tin nhắn MQTT và thông báo tới các SignalR clients
var hubContext = app.Services.GetRequiredService<IHubContext<MqttHub>>();

mqttClient.ApplicationMessageReceivedAsync += async e =>
{
    var message = Encoding.UTF8.GetString(e.ApplicationMessage.PayloadSegment);
    receivedMessages.Add(message);
    Console.WriteLine($"Nhận được tin nhắn: {message}");

    // Thông báo tới tất cả các SignalR clients kết nối
    await hubContext.Clients.All.SendAsync("ReceiveMessage", message);
};

// Ngắt kết nối khi ứng dụng dừng
var lifetime = app.Lifetime;
lifetime.ApplicationStopping.Register(async () =>
{
    if (mqttClient.IsConnected)
    {
        await mqttClient.DisconnectAsync();
        Console.WriteLine("Đã ngắt kết nối khỏi MQTT broker.");
    }
});

// Chạy ứng dụng
app.Run();