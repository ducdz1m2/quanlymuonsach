<template>
    <div class="chatbox-backdrop" @click.self="$emit('close')">
        <div class="chatbox">
            <div class="chatbox-header">
                <h5>💬 Chat với Admin</h5>
                <button class="clear-btn" @click="clearMessages" title="Ẩn tất cả tin nhắn">
                    🗑 Xóa hết
                </button>
            </div>

            <div class="messages" ref="messagesContainer">
                <div v-for="m in messages" :key="m._id || m.createdAt" class="message"
                    :class="{ me: m.sender === currentUser }">
                    <strong>{{ m.sender }}:</strong> {{ m.text }}
                </div>
            </div>

            <div class="input-area">
                <input v-model="newMessage" placeholder="Nhập tin nhắn..." @keyup.enter="sendMessage" />
                <button class="btn btn-primary btn-sm" @click="sendMessage">
                    Gửi
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { io } from "socket.io-client";
import messageService from "@/services/message.service";

// ⚙️ Kết nối socket tới backend
const socket = io("http://localhost:3000");

export default {
    props: {
        roomId: { type: String, required: true },
        sender: { type: Object, required: true },
    },

    data() {
        return {
            messages: [],
            newMessage: "",
            currentUser: this.sender.ten,
        };
    },

    methods: {
        // 🔹 Tải tin nhắn từ DB
        async loadMessages() {
            try {
                this.messages = await messageService.getByRoom(this.roomId);
                this.$nextTick(() => this.scrollToBottom());
            } catch (err) {
                console.error("Lỗi tải tin nhắn:", err);
            }
        },

        // 🔹 Gửi tin nhắn mới
        async sendMessage() {
            if (!this.newMessage.trim()) return;
            try {
                const message = {
                    room: this.roomId,
                    sender: this.currentUser,
                    text: this.newMessage.trim(),
                };

                await messageService.create(message);
                socket.emit("sendMessage", message);

                this.newMessage = "";
                this.$nextTick(() => this.scrollToBottom());
            } catch (err) {
                console.error("Lỗi gửi tin nhắn:", err);
            }
        },

        // 🔹 Ẩn toàn bộ tin nhắn khỏi UI (client-side)
        clearMessages() {
            this.messages = [];
        },

        // 🔹 Cuộn xuống cuối
        scrollToBottom() {
            const container = this.$refs.messagesContainer;
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        },
    },

    mounted() {
        this.loadMessages();
        socket.emit("joinRoom", this.roomId);

        socket.on("receiveMessage", (msg) => {
            if (msg.room === this.roomId) {
                this.messages.push(msg);
                this.$nextTick(() => this.scrollToBottom());
            }
        });
    },

    beforeUnmount() {
        socket.off("receiveMessage");
        socket.emit("leaveRoom", this.roomId);
    },
};
</script>

<style scoped>
.chatbox-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

.chatbox {
    background: white;
    border-radius: 10px;
    width: 350px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    padding: 15px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.chatbox-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.clear-btn {
    background: transparent;
    border: none;
    color: #888;
    font-size: 16px;
    cursor: pointer;
}

.clear-btn:hover {
    color: red;
}

.messages {
    flex: 1;
    overflow-y: auto;
    background: #f9f9f9;
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 10px;
}

.message {
    margin: 4px 0;
    background: #eaeaea;
    padding: 6px 10px;
    border-radius: 8px;
    max-width: 80%;
    word-break: break-word;
}

.message.me {
    background: #d1e7ff;
    margin-left: auto;
}

.input-area {
    display: flex;
    gap: 6px;
}
</style>
