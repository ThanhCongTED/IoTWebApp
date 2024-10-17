let isOn = true; // Khai báo biến để lưu trạng thái

const connection = new signalR.HubConnectionBuilder()
    .withUrl("/mqttHub") // Đường dẫn đến Hub
    .build();

// Hàm gửi tin nhắn
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
    button.innerText = isOn ? "Tắt" : "Bật";
}

// Hàm để bật/tắt nút
function toggleSwitch() {
    isOn = !isOn; // Chuyển đổi trạng thái
    updateButtonState(); // Cập nhật giao diện

    // Gửi tín hiệu đến MQTT broker
    const payload = isOn ? "on" : "off";
    sendMessage(payload); // Gửi tin nhắn
}

// Kết nối SignalR
connection.start()
    .then(() => {
        console.log("Kết nối SignalR thành công.");
        connection.on("ReceiveMessage", (message) => {
            console.log("Nhận được tin nhắn:", message);
            // Cập nhật trạng thái từ tin nhắn MQTT
            isOn = message === "on"; // Cập nhật trạng thái
            updateButtonState(); // Cập nhật giao diện
        });
    })
    .catch(err => console.error(err.toString()));
