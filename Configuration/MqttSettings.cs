using System;

namespace IoTWebApp.Configuration
{
    public class MqttSettings
    {
        public string Broker { get; set; }
        public int Port { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string ClientId { get; set; }

        // Các thuộc tính cho topic
        public string Token_Topic { get; set; }
        public string CmndTopic => $"ThanhCong/{Token_Topic}/cmnd/POWER"; // Topic để gửi lệnh
        public string StatTopic => $"ThanhCong/{Token_Topic}/stat/POWER"; // Topic để nhận trạng thái
        public string SensorTopic => $"ThanhCong/{Token_Topic}/tele/SENSOR"; // Topic để nhận trạng thái
        public string TeleTopic => $"ThanhCong/{Token_Topic}/cmnd/TelePeriod"; // Topic để nhận trạng thái
        public string LwtTopic => $"ThanhCong/{Token_Topic}/tele/LWT"; // Topic để nhận trạng thái
        public string SubscribeTopic()
        {
            return $"ThanhCong/{Token_Topic}/#";
        }
    }
}
