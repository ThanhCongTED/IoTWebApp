using Microsoft.AspNetCore.SignalR;
using MQTTnet;
using MQTTnet.Client;
using System.Text;
using System.Threading.Tasks;
using IoTWebApp.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options; // Thêm dòng này

namespace IoTWebApp.Hubs
{
    public class MqttHub : Hub
    {
        private readonly IMqttClient _mqttClient;
        private readonly MqttSettings _mqttSettings;

        public MqttHub(IMqttClient mqttClient, IOptions<MqttSettings> mqttSettings) 
        {
            _mqttClient = mqttClient;
            _mqttSettings = mqttSettings.Value; // Nhận cấu hình MqttSettings từ DI
        }
        private static Dictionary<int, bool> deviceStates = new Dictionary<int, bool>
        {
            { 1, false }, // Trạng thái của thiết bị 1 (off)
            { 2, false }, // Trạng thái của thiết bị 2 (off)
            { 3, false }  // Trạng thái của thiết bị 3 (off)
        };

        public async Task SendMessage(string topic, string message)
        {
            if (_mqttClient.IsConnected)
            {
                try
                {
                    // Xây dựng tin nhắn MQTT
                    var mqttMessage = new MqttApplicationMessageBuilder()
                        .WithTopic(topic)
                        .WithPayload(Encoding.UTF8.GetBytes(message))
                        .WithQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.ExactlyOnce)
                        .WithRetainFlag(true)
                        .Build();

                    // Gửi tin nhắn
                    await _mqttClient.PublishAsync(mqttMessage);
                    //Console.WriteLine($"Đã gửi tin nhắn '{message}' đến topic '{topic}'deviceId '{deviceId}'");
                                // Cập nhật trạng thái thiết bị
                    
        
                        //deviceStates[deviceId] = message == "on";
                    //await Clients.All.SendAsync("ReceiveMessage",topic, message); trạng thai nút nhấn lấy ở MQTT

                    Console.WriteLine($"Đã gửi tin nhắn '{message}' đến topic '{topic}'");
                
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Lỗi khi gửi tin nhắn: {ex.Message}");
                }
            }
            else
            {
                Console.WriteLine("MQTT client chưa được kết nối.");
            }
        }


        public Task<MqttSettings> GetMqttSettings()
        {
            return Task.FromResult(_mqttSettings); // Trả về cấu hình MqttSettings
        }

        public async Task<Dictionary<int, string>> GetCurrentState()
        {
            // Trả về trạng thái hiện tại của các thiết bị
            var currentState = deviceStates.ToDictionary(
                x => x.Key, 
                x => x.Value ? "on" : "off"
            );

            return currentState;
        }

    }
}
