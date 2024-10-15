using Microsoft.AspNetCore.Mvc;
using MQTTnet;
using MQTTnet.Client;
//using MQTTnet.Client.Options;
using System;
using System.Text;
using System.Threading.Tasks;

namespace IoTWebApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MqttController : ControllerBase
    {
        private readonly IMqttClient _mqttClient;

        public MqttController(IMqttClient mqttClient)
        {
            _mqttClient = mqttClient;
        }

        [HttpPost("ON")]
        public async Task<IActionResult> TurnOn()
        {
            try
            {
                // Tạo tin nhắn để gửi
                var message = new MqttApplicationMessageBuilder()
                    .WithTopic("your/command/topic") // Thay thế bằng topic thực tế của bạn
                    .WithPayload("ON")
                    .WithQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.ExactlyOnce) // Sử dụng QoS 2
                    .WithRetainFlag()
                    .Build();

                await _mqttClient.PublishAsync(message); // Đảm bảo là async
                return Ok("Command sent: ON");
            }
            catch (Exception ex)
            {
                // Ghi lại thông báo lỗi
                Console.WriteLine($"Error in TurnOn: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("OFF")]
        public async Task<IActionResult> TurnOff()
        {
            try
            {
                // Tạo tin nhắn để gửi
                var message = new MqttApplicationMessageBuilder()
                    .WithTopic("your/command/topic") // Thay thế bằng topic thực tế của bạn
                    .WithPayload("OFF")
                    .WithQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.ExactlyOnce) // Sử dụng QoS 2
                    .WithRetainFlag()
                    .Build();

                await _mqttClient.PublishAsync(message); // Đảm bảo là async
                return Ok("Command sent: OFF");
            }
            catch (Exception ex)
            {
                // Ghi lại thông báo lỗi
                Console.WriteLine($"Error in TurnOff: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
