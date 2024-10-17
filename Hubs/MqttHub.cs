using Microsoft.AspNetCore.SignalR;
using MQTTnet;
using MQTTnet.Client;
using System.Threading.Tasks;

namespace IoTWebApp.Hubs
{
    public class MqttHub : Hub
    {
        private readonly IMqttClient mqttClient;

        // Biến lưu trữ trạng thái hiện tại
        private static bool isOn; // Giả sử trạng thái này được lưu trữ ở đây

        // Constructor để inject IMqttClient
        public MqttHub(IMqttClient mqttClient)
        {
            this.mqttClient = mqttClient;
        }

        // Phương thức để gửi tín hiệu đến MQTT broker
        public async Task SendMessage(string message)
        {
            // Gửi tín hiệu tới MQTT broker
            await mqttClient.PublishAsync(new MqttApplicationMessageBuilder()
                .WithTopic("your/topic") // Thay đổi "your/topic" thành topic mà bạn muốn gửi
                .WithPayload(message)
                .WithQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.ExactlyOnce) // Sử dụng QoS 2
                .WithRetainFlag()
                .Build());
            
            Console.WriteLine($"Gửi tin nhắn: {message}");
            isOn = message == "on"; // Cập nhật trạng thái khi gửi tin nhắn
            await Clients.All.SendAsync("ReceiveMessage", message);
        }

        // Phương thức để lấy trạng thái hiện tại từ server
        public async Task GetCurrentState()
        {
            // Gửi trạng thái hiện tại cho client
            await Clients.Caller.SendAsync("ReceiveMessage", isOn ? "on" : "off");
        }
    }
}
