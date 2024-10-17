using Microsoft.AspNetCore.SignalR;
using MQTTnet;
using MQTTnet.Client;
using System.Threading.Tasks;

namespace IoTWebApp.Hubs
{
    public class MqttHub : Hub
    {
        private readonly IMqttClient mqttClient;

        // Constructor để inject IMqttClient
        public MqttHub(IMqttClient mqttClient)
        {
            this.mqttClient = mqttClient;
        }

        // Phương thức SendMessage để gửi tín hiệu đến MQTT broker
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
            await Clients.All.SendAsync("ReceiveMessage", message);
        }
    }
}
