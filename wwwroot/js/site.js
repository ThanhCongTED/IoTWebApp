let isOn = false; // Biến lưu trạng thái ban đầu của nút

// Kết nối tới SignalR Hub
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/MqttHub") // Đường dẫn đến Hub
    .build();

// Hàm để bật/tắt nút
function toggleSwitch() {
    isOn = !isOn; // Chuyển đổi trạng thái
    updateButtonState(); // Cập nhật giao diện

    // Gửi tín hiệu tới MQTT broker
    const payload = isOn ? "on" : "off";
    connection.invoke("SendMessage", payload) // Gọi hàm SendMessage
        .catch(err => console.error(err.toString()));
}

// Hàm để cập nhật giao diện khi thay đổi trạng thái
function updateButtonState() {
    const button = document.getElementById("toggleButton");
    button.classList.toggle('on', isOn);  // Thêm class 'on' nếu isOn = true
    button.classList.toggle('off', !isOn); // Thêm class 'off' nếu isOn = false
    button.innerText = isOn ? "Bật" : "Tắt"; // Đổi nhãn của nút
}

// Kết nối SignalR
connection.start()
    .then(() => {
        console.log("Kết nối SignalR thành công.");
        connection.on("ReceiveMessage", (message) => {
            // Cập nhật trạng thái dựa trên tin nhắn nhận từ MQTT
            isOn = message === "on";
            updateButtonState(); // Cập nhật giao diện
        });
    })
    .catch(err => console.error(err.toString()));
