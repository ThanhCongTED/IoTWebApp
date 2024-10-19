using Microsoft.AspNetCore.SignalR;
using MQTTnet;
using MQTTnet.Client;
using System.Threading.Tasks;

namespace IoTWebApp.Hubs
{
    public class MqttHub : Hub
    {
        private readonly IMqttClient mqttClient;

        // Giả sử trạng thái hiện tại của các thiết bị được lưu trữ tại đây
        private static Dictionary<int, bool> deviceStates = new Dictionary<int, bool>
        {
            { 1, false }, // Trạng thái của thiết bị 1 (off)
            { 2, false }, // Trạng thái của thiết bị 2 (off)
            { 3, false }  // Trạng thái của thiết bị 3 (off)
        };

        // Constructor để inject IMqttClient
        public MqttHub(IMqttClient mqttClient)
        {
            this.mqttClient = mqttClient;
        }

        // Phương thức để gửi tin nhắn đến MQTT broker
        public async Task SendMessage(string topic1, string message)
        {
            // Gửi tín hiệu tới MQTT broker
            await mqttClient.PublishAsync(new MqttApplicationMessageBuilder()
                .WithTopic(topic1) 
                .WithPayload(message)
                .WithQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.ExactlyOnce)
                .WithRetainFlag()
                .Build());

        }
        public async Task SendMessage1(string topic, string message)
        {

            // Cập nhật trạng thái thiết bị
            int deviceId = GetDeviceIdFromTopic(topic);
            if (deviceId > 0)
            {
                deviceStates[deviceId] = message == "ON";
                await Clients.All.SendAsync("ReceiveMessage", topic, message);
            }
        }

        // Phương thức để gửi lại trạng thái ban đầu của các thiết bị khi có kết nối mới
        public async Task<Dictionary<int, string>> GetCurrentState()
        {
            // Trả về trạng thái hiện tại của các thiết bị
            var currentState = deviceStates.ToDictionary(
                x => x.Key, 
                x => x.Value ? "ON" : "OFF"
            );

            return currentState;
        }

        private int GetDeviceIdFromTopic(string topic)
        {
            switch (topic)
            {
                case "ThanhCong/TED90_8773C6/stat/POWER": return 1;
                case "ThanhCong/TED90_8773C6/stat/POWER2": return 2;
                case "ThanhCong/TED90_8773C6/stat/POWER3": return 3;
                default: return -1;
            }
        }
    }
}