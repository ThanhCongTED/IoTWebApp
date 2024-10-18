let deviceStates = {
    1: false, // Trạng thái của thiết bị 1 (off)
    2: false, // Trạng thái của thiết bị 2 (off)
    3: false   // Trạng thái của thiết bị 3 (off)
};

// Khởi tạo kết nối SignalR
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/mqttHub") // Đường dẫn đến MqttHub
    .build();

// Hàm gửi tin nhắn tới MQTT broker
function sendMessage(deviceId, status) {
    const message = status ? "on" : "off";
    
    let topic = ""; // Định nghĩa biến topic

    // Xác định topic dựa trên deviceId
    switch (deviceId) {
        case 1:
            topic = "topic/device1"; // Topic cho thiết bị 1
            break;
        case 2:
            topic = "topic/device2"; // Topic cho thiết bị 2
            break;
        case 3:
            topic = "topic/device3"; // Topic cho thiết bị 3
            break;
        default:
            console.error("Thiết bị không hợp lệ.");
            return;
    }

    connection.invoke("SendMessage", topic, message) // Gửi topic cùng với message
        .catch(err => console.error("Lỗi khi gửi tin nhắn:", err));
}

// Hàm để cập nhật giao diện của các nút
function updateButtonState(deviceId) {
    const device = document.getElementById(`device${deviceId}`);
    const indicator = document.getElementById(`indicator${deviceId}`);
    
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

// Khởi tạo trạng thái ban đầu của các nút từ MQTT (nếu có)
function initializeButtonState() {
    for (let i = 1; i <= 3; i++) {
        updateButtonState(i); // Cập nhật giao diện ban đầu
    }
}

// Kết nối SignalR
connection.start()
    .then(() => {
        console.log("Kết nối SignalR thành công.");

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

        // Lắng nghe sự kiện khi có tin nhắn MQTT đến từ server
        connection.on("ReceiveMessage", (topic, message) => {
            // Xử lý tin nhắn nhận từ MQTT
            let deviceId;

            // Xác định deviceId dựa trên topic
            if (topic === "topic/device1") {
                deviceId = 1;
            } else if (topic === "topic/device2") {
                deviceId = 2;
            } else if (topic === "topic/device3") {
                deviceId = 3;
            }

            // Cập nhật trạng thái thiết bị
            deviceStates[deviceId] = message.trim() === "on";
            updateButtonState(deviceId);
        });

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
