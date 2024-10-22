let deviceStates = {
    1: false, // Trạng thái của thiết bị 1 (off)
    2: false, // Trạng thái của thiết bị 2 (off)
    3: false  // Trạng thái của thiết bị 3 (off)
};


// Khởi tạo kết nối SignalR
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/mqttHub") // Đường dẫn đến MqttHub
    .build();

// Hàm gửi tin nhắn tới MQTT broker
function sendMessage(deviceId, status) {
    const message = status ? "ON" : "OFF";

    let topic = ""; // Định nghĩa biến topic

    connection.invoke("GetMqttSettings")
    .then(settings => {
        mqttSettings = settings; // Cập nhật cấu hình MQTT từ server
        //console.log("Cấu hình MQTT đã nhận:", mqttSettings);

        let SendTopic = mqttSettings.token_Topic;
        //console.log("Giá trị SendTopic:", SendTopic, "Giá trị deviceId:", deviceId);

        topic =  "ThanhCong/"+ SendTopic + "/cmnd/POWER"+ deviceId;
        //console.log("Giá trị SendTopic:", topic);
        connection.invoke("SendMessage", topic, message)
            .catch(err => console.error("Lỗi khi gửi tin nhắn:", err));
    })


}
// Hàm gửi tin nhắn tới MQTT broker
function sendMessageSensor() {

    let topic = ""; // Định nghĩa biến topic
    let message = ""; // Định nghĩa biến 

    connection.invoke("GetMqttSettings")
    .then(settings => {
        mqttSettings = settings; // Cập nhật cấu hình MQTT từ server
        //console.log("Cấu hình MQTT đã nhận:", mqttSettings);

        let SendTopic = mqttSettings.token_Topic;
        //console.log("Giá trị SendTopic:", SendTopic, "Giá trị deviceId:", deviceId);

        topic =  "ThanhCong/"+ SendTopic + "/cmnd/TelePeriod";
        //console.log("Gửi Topic lấy giá tri sensor:", topic);
        connection.invoke("SendMessage", topic, message)
            .catch(err => console.error("Lỗi khi gửi tin nhắn:", err));
    })


}



function sendMessageSwith(deviceId) {

    let message="";
    connection.invoke("GetMqttSettings")
    .then(settings => {
        mqttSettings = settings; // Cập nhật cấu hình MQTT từ server
        //console.log("Cấu hình MQTT đã nhận:", mqttSettings);

        let SendTopic = mqttSettings.token_Topic;
        
        //console.log("Giá trị SendTopic:", SendTopic, "Giá trị deviceId:", deviceId);

        topic =  "ThanhCong/"+ SendTopic + "/cmnd/POWER"+ deviceId;
        //console.log("Giá trị SendTopic:", topic);
        connection.invoke("SendMessage", topic, message)
            .catch(err => console.error("Lỗi khi gửi tin nhắn:", err));
    })

}

// Hàm để cập nhật giao diện của các nút
function updateButtonState(deviceId) {
    const device = document.getElementById(`device${deviceId}`);
    const indicator = document.getElementById(`indicator${deviceId}`);
    //console.log("cập nhập trạng thái nút nhấn lên Web.", deviceId);
    
    if (deviceStates[deviceId]) {
        device.classList.add("on");
        device.classList.remove("off");
        indicator.classList.add("on");
        indicator.classList.remove("off");
    } else {
        device.classList.add("off");
        device.classList.remove("on");
        indicator.classList.add("off");
        indicator.classList.remove("on");
    }
}

// Hàm để bật/tắt nút
function toggleSwitch(deviceId) {
    deviceStates[deviceId] = !deviceStates[deviceId]; // Chuyển đổi trạng thái
    updateButtonState(deviceId); // Cập nhật giao diện
    sendMessage(deviceId, deviceStates[deviceId]); // Gửi tín hiệu đến MQTT broker

}

function initializeButtonState() {
    for (let i = 1; i <= 3; i++) {
        updateButtonState(i); // Cập nhật giao diện ban đầu
    }
}


// Hàm để cập nhật các giá trị
function updateStateSensor(message){
    let parsedMessage;

    // Kiểm tra nếu message là chuỗi, phân tích cú pháp JSON
    if (typeof message === "string") {
        try {
            parsedMessage = JSON.parse(message); // Parse JSON nếu message là chuỗi
        } catch (error) {
            console.error("Lỗi phân tích cú pháp JSON:", error);
            return;
        }
    } else {
        parsedMessage = message; // Nếu message đã là đối tượng thì giữ nguyên
    }

// Kiểm tra sự tồn tại của ENERGY trong parsedMessage
    if (parsedMessage && parsedMessage.ENERGY) {
// Truy cập các giá trị từ ENERGY
        let HVoltage = parsedMessage.ENERGY.Voltage;
        let HCurrent = parsedMessage.ENERGY.Current.toFixed(1);
        let totalEnergy = Math.round(parsedMessage.ENERGY.Total);
        let todayEnergy = Math.round(parsedMessage.ENERGY.Today);   

        console.log("Điện Áp:", HVoltage); // In ra giá trị Total
        console.log("Dòng Điện:", HCurrent); // In ra giá trị Today
        console.log("Total Energy:", totalEnergy); // In ra giá trị Total
        console.log("Today's Energy:", todayEnergy); // In ra giá trị Today


// Cập nhật giao diện (nếu cần thiết)
        document.getElementById('voltage').innerText = `Điện Áp: ${HVoltage} V`;
        document.getElementById('current').innerText = `Dòng Điện: ${HCurrent} A`;
        document.getElementById('Today').innerText = `Công suất Hôm Nay: ${todayEnergy}KW/H`;
        document.getElementById('Total').innerText = `Tổng Công suất: ${totalEnergy}KW`;
    } else {
    console.error("ENERGY object is undefined or not available in the message.");
    }




}



// Kết nối SignalR
connection.start()
    .then(() => {
        //console.log("Kết nối SignalR thành công.");

        sendMessageSensor()// cập nhập trạng thái đồng hồ 
        let Stas_Buttom = 1;
    // gửi tín hiệu để cập nhật các nút nhấn
        sendMessageSwith(Stas_Buttom)
        Stas_Buttom = 2;
        sendMessageSwith(Stas_Buttom)
        Stas_Buttom = 3;
        sendMessageSwith(Stas_Buttom)

/*      

        setTimeout(() => {
            sendMessageSensor()// cập nhập trạng thái đồng hồ  
            console.log("Thực hiện thao tác sau 9 giây.");
            // Thực hiện các hành động khác ở đây sau khi delay
        }, 9000); // 2000ms = 2 giây

         // Yêu cầu trạng thái hiện tại từ server khi kết nối thành công
        connection.invoke("GetCurrentState")
            .then(initialState => {
                console.log("Trạng thái ban đầu:", initialState);
                for (let deviceId in initialState) {
                    deviceStates[deviceId] = initialState[deviceId] === "on"; // Cập nhật trạng thái ban đầu từ server
                    updateButtonState(deviceId); // Cập nhật giao diện
                }
            })
            .catch(err => console.error("Lỗi khi lấy trạng thái ban đầu:", err));

*/
                // Lắng nghe sự kiện khi có tin nhắn MQTT đến từ server
        connection.on("ReceiveMessage", (topic, message) => {
                    // Xử lý tin nhắn nhận từ MQTT

            connection.invoke("GetMqttSettings")
                .then(settings => {
                     mqttSettings = settings; // Cập nhật cấu hình MQTT từ server
                    //console.log("Cấu hình MQTT đã nhận:", mqttSettings);

                    let Stat_Topic = mqttSettings.statTopic;
                    //console.log("Giá trị StatTopic:", Stat_Topic);
                    //console.log("Giá trị StatTopic:", Stat_Topic);
                    //console.log("Giá trị topicall:", topic);           
                    //console.log("Giá trị messageall:", message);//console.log("Giá trị StatTopic:", Stat_Topic);
                    let Senesor_Topic = mqttSettings.sensorTopic;   
                    //console.log("Giá trị Senesor_Topic:", Senesor_Topic);  
                    let LWT_Topic = mqttSettings.lwtTopic;   
                    //console.log("Topic online/offline:", LWT_Topic);  
                    
                let deviceId ="";

                if (topic ===  Stat_Topic ) {

                    deviceId = 1;
                    deviceStates[deviceId] = message.trim() === "ON";
                    updateButtonState(deviceId);
                }
                else if (topic === Stat_Topic + "1") {
                    deviceId = 1;
                    deviceStates[deviceId] = message.trim() === "ON";
                    updateButtonState(deviceId);
                }  
                else if (topic === Stat_Topic + "2") {
                    deviceId = 2;
                    deviceStates[deviceId] = message.trim() === "ON";
                    updateButtonState(deviceId);
                } 
                else if (topic === Stat_Topic + "3") {
                    deviceId = 3;
                    deviceStates[deviceId] = message.trim() === "ON";
                    updateButtonState(deviceId);
                }

                else if (topic === LWT_Topic ) {

                    console.log("Trạng Thái Thiết Bị:", message);
                    

                }    
                else if (topic === Senesor_Topic ) {

                // In toàn bộ message để kiểm tra
                    //console.log("Received message:", message);
                    updateStateSensor(message);

                }    
                

                else {
                    //console.log("Giá trị Topic không đúng :", topic);//console.log("Giá trị StatTopic:", Stat_Topic);
                }
                   

                })

                })
                        
    })
    .catch(err => console.error("Lỗi khi kết nối SignalR:", err));

    // Gọi phương thức initializeButtonState với trạng thái nhận được từ MQTT
connection.on("CurrentState", (initialState) => {
    console.log("Nhận trạng thái ban đầu từ server:", initialState);
    for (let deviceId in initialState) {
        deviceStates[deviceId] = initialState[deviceId] === "on"; // Cập nhật trạng thái ban đầu từ server
        updateButtonState(deviceId); // Cập nhật giao diện
    }
});