using Microsoft.AspNetCore.SignalR;
using MQTTnet;
using MQTTnet.Client;
using System.Threading.Tasks;

namespace IoTWebApp.Hubs
{
    public class MqttHub : Hub
    {
        private readonly IMqttClient mqttClient;

        public MqttHub(IMqttClient mqttClient)
        {
            this.mqttClient = mqttClient;
        }

        // Phương thức gửi tín hiệu đến MQTT broker
        public async Task SendMessage(string topic, string message)
        {
            // Gửi tín hiệu tới MQTT broker
            await mqttClient.PublishAsync(new MqttApplicationMessageBuilder()
                .WithTopic(topic)
                .WithPayload(message)
                .WithQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.ExactlyOnce)
                .WithRetainFlag()
                .Build());

            Console.WriteLine($"Gửi tin nhắn: {message} tới topic: {topic}");
            // Thông báo tới tất cả clients về trạng thái mới
            await Clients.All.SendAsync("ReceiveMessage", topic, message);
        }
    }
}
