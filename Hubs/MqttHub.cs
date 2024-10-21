using Microsoft.AspNetCore.SignalR;
using MQTTnet;
using MQTTnet.Client;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IoTWebApp.Hubs
{
    public class MqttHub : Hub
    {
        private readonly IMqttClient mqttClient;
        private static Dictionary<int, bool> deviceStates = new Dictionary<int, bool>
        {
            { 1, false }, // Trạng thái thiết bị 1
            { 2, false }, // Trạng thái thiết bị 2
            { 3, false }  // Trạng thái thiết bị 3
        };

        public MqttHub(IMqttClient mqttClient)
        {
            this.mqttClient = mqttClient;
        }

        // Gửi tín hiệu tới MQTT broker
        public async Task SendMessage(string topic, string message)
        {
            await mqttClient.PublishAsync(new MqttApplicationMessageBuilder()
                .WithTopic(topic)
                .WithPayload(message)
                .WithQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.ExactlyOnce)
                .WithRetainFlag()
                .Build());
        }

        // Nhận tín hiệu từ MQTT và cập nhật trạng thái thiết bị
        public async Task SendMessageReceive(string topic, string message)
        {
            if (message != "ON" && message != "OFF")
                return;

            int deviceId = GetDeviceIdFromTopic(topic);
            if (deviceId > 0 && deviceStates[deviceId] != (message == "ON"))
            {
                deviceStates[deviceId] = message == "ON";
                await Clients.All.SendAsync("ReceiveMessage", topic, message);
            }
        }

        // Lấy trạng thái hiện tại của tất cả thiết bị
        public async Task<Dictionary<int, string>> GetCurrentState()
        {
            var currentState = deviceStates.ToDictionary(
                x => x.Key,
                x => x.Value ? "ON" : "OFF"
            );
            return currentState;
        }

        // Xác định deviceId từ topic
        private int GetDeviceIdFromTopic(string topic)
        {
            if (topic.EndsWith("POWER1"))
                return 1;
            if (topic.EndsWith("POWER2"))
                return 2;
            if (topic.EndsWith("POWER3"))
                return 3;

            return -1;
        }
    }
}
