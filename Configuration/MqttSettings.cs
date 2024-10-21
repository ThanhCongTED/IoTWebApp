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
        public string TopicPower { get; set; }
        public string Topic { get; set; }

        public string SubscribeTopic()
        {
            return $"ThanhCong/{Topic}/#";
        }


        public string TopicSend1()
        {
                 return $"ThanhCong/{Topic}/#";
        }

        public string TopicReceivePOWER(int powerNumber)
        {
            switch (powerNumber)
            {
                case 1:
                    return $"ThanhCong/{Topic}/stat/POWER1";
                case 2:
                    return $"ThanhCong/{Topic}/stat/POWER2";
                case 3:
                    return $"ThanhCong/{Topic}/stat/POWER3";
                default:
                    return null;
            }
        }
    }
}
