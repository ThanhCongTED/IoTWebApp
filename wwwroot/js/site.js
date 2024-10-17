let isOn = true; // Khai báo biến để lưu trạng thái

const connection = new signalR.HubConnectionBuilder()
    .withUrl("/MqttHub") // Đường dẫn đến Hub
    .build();

// Hàm gửi tin nhắn tới MQTT broker
async function sendMessage(message) {
    try {
        await connection.invoke("SendMessage", message);
    } catch (err) {
        console.error(err);
    }
}

// Hàm để cập nhật giao diện người dùng
function updateButtonState() {
    const button = document.getElementById("toggleButton");
    button.innerText = isOn ? "Bật" : "Tắt";
    button.style.backgroundColor = isOn ? "green" : "red"; // Đổi màu nền nút theo trạng thái
}

// Hàm để bật/tắt nút
function toggleSwitch() {
    isOn = !isOn; // Chuyển đổi trạng thái
    updateButtonState(); // Cập nhật giao diện

    // Gửi tín hiệu đến MQTT broker
    const payload = isOn ? "on" : "off";
    sendMessage(payload); // Gửi tin nhắn
}

// Hàm khởi tạo trạng thái nút nhấn từ MQTT
function initializeButtonState(initialState) {
    isOn = (initialState === "on");
    updateButtonState(); // Cập nhật giao diện
}

// Kết nối SignalR
connection.start()
    .then(() => {
        console.log("Kết nối SignalR thành công.");
        
        // Gọi phương thức để lấy trạng thái hiện tại từ server
        connection.invoke("GetCurrentState")
            .catch(err => console.error(err.toString()));
        
        connection.on("ReceiveMessage", (message) => {
            // Cập nhật trạng thái từ tin nhắn MQTT
            isOn = message === "on"; // Cập nhật trạng thái
            updateButtonState(); // Cập nhật giao diện
        });
    })
    .catch(err => console.error(err.toString()));

// Gọi phương thức initializeButtonState với trạng thái nhận được từ MQTT
connection.on("CurrentState", (initialState) => {
    initializeButtonState(initialState);
});
