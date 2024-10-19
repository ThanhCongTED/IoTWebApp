namespace IoTWebApp.Configuration
{
    public class MqttSettings
    {
        public string ClientId { get; set; }
        public string Broker { get; set; }
        public int Port { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string ControlTopic { get; set; }
        public string SubscribeTopic { get; set; }
        public string TopicPower { get; set; }
    }
}

