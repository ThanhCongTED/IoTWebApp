using IoTWebApp.Hubs;
using IoTWebApp.Configuration;

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
    const message = status ? "ON" : "OFF";

    let topicsend = ""; // Định nghĩa biến topic
    let topicReceive = ""; // Định nghĩa biến topic

    // Xác định topic dựa trên deviceId
    switch (deviceId) {
        case 1:
            topicsend = mqttSettings.TopicSend1();  // Gọi phương thức cho thiết bị 1
            topicReceive = TopicReceivePOWER(1); // Gọi phương thức cho thiết bị 1
            break;
        case 2:
            topicsend = TopicSendPOWER(); // Gọi phương thức cho thiết bị 2
            topicReceive = TopicReceivePOWER(2); // Gọi phương thức cho thiết bị 2
            break;
        case 3:
            topicsend = TopicSendPOWER(); // Gọi phương thức cho thiết bị 3
            topicReceive = TopicReceivePOWER(3); // Gọi phương thức cho thiết bị 3
            break;
        default:
            console.error("Thiết bị không hợp lệ.");  // Ghi log lỗi
            return;
    }

    // Gửi tin nhắn tới topic
    connection.invoke("SendMessage", topicsend, message) // Gửi topic cùng với message
        .catch(err => console.error("Lỗi khi gửi tin nhắn:", err));

    // Nếu bạn cần gửi tin nhận, gọi invoke ở đây
    connection.invoke("SendMessageReceive", topicReceive, message) // Gửi topic cùng với message
        .catch(err => console.error("Lỗi khi gửi tin nhắn nhận:", err));
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
                    deviceStates[deviceId] = initialState[deviceId] === "ON"; // Cập nhật trạng thái ban đầu từ server
                    updateButtonState(deviceId); // Cập nhật giao diện
                }
            })
            .catch(err => console.error("Lỗi khi lấy trạng thái ban đầu:", err));

        // Lắng nghe sự kiện khi có tin nhắn MQTT đến từ server
        connection.on("ReceiveMessage", (topic, message) => {
            // Xử lý tin nhắn nhận từ MQTT
            let deviceId = -1; // Khởi tạo deviceId với giá trị không hợp lệ

            // Xác định deviceId dựa trên topic
            if (topic === TopicReceivePOWER(1)) {
                deviceId = 1;
            } else if (topic === TopicReceivePOWER(2)) {
                deviceId = 2;
            } else if (topic === TopicReceivePOWER(3)) {
                deviceId = 3;
            }

            // Kiểm tra nếu deviceId hợp lệ
            if (deviceId !== -1) {
                // Cập nhật trạng thái thiết bị
                deviceStates[deviceId] = message.trim() === "ON";
                updateButtonState(deviceId);
            } else {
                console.error("Device ID không xác định cho topic:", topic);
            }
        });
    })