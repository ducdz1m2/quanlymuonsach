<template>
    <div class="chatbox-backdrop" @click.self="$emit('close')">
        <div class="chatbox">
            <div class="chatbox-header">
                <h5>💬 Chat với {{ target.ten }}</h5>
                <button class="clear-btn" @click="clearMessages" title="Ẩn tất cả tin nhắn">
                    🗑 Xóa hết
                </button>
            </div>

            <div class="messages" ref="messagesContainer">
                <div v-for="m in messages" :key="m._id" class="message" :class="{ me: m.sender === currentUser }">
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
import { socket } from "@/services/socket";
import messageService from "@/services/message.service";

// ⚙️ Kết nối Socket.IO tới backend


export default {
    props: {
        target: { type: Object, required: true },
        sender: { type: Object, required: true },
    },
    data() {
        return {

            messages: [],
            newMessage: "",
            currentUser: this.sender.hoTenNV,

        };
    },
    methods: {
        scrollToBottom() {
            this.$nextTick(() => {
                const container = this.$refs.messagesContainer;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            });
        },
        async loadMessages() {
            try {
                let msgs = await messageService.getByRoom(this.target._id);

                // bỏ tin nhắn mới nhất (phần tử cuối cùng)
                if (msgs.length > 0) {
                    msgs.pop();
                }

                this.messages = msgs;
                this.scrollToBottom();
            } catch (err) {
                console.error("Lỗi tải tin nhắn:", err);
            }
        },


        async sendMessage() {
            if (!this.newMessage.trim()) return;
            try {
                const message = {
                    room: this.target._id,
                    sender: this.currentUser,
                    text: this.newMessage.trim(),
                };

                const saved = await messageService.create(message);
                socket.emit("sendMessage", saved);
                this.newMessage = "";
                this.scrollToBottom();
            } catch (err) {
                console.error("Lỗi gửi tin nhắn:", err);
            }
        },

        // 🔹 Ẩn tất cả tin nhắn khỏi giao diện (client-side)
        clearMessages() {

            this.messages = [];

        },
    },

    mounted() {
        // 1. Đăng ký listener trước
        const onMessage = (msg) => {
            if (!this.messages.find(m => m._id === msg._id) && msg.room === this.target._id) {
                this.messages.push(msg);
                this.scrollToBottom();
            }
        };
        this._onMessage = onMessage;
        socket.on("receiveMessage", onMessage);

        // 2. Tham gia room
        socket.emit("joinRoom", this.target._id);

        // 3. Load tin nhắn cũ
        this.loadMessages();
    },

    beforeUnmount() {
        if (this._onMessage) {
            socket.off("receiveMessage", this._onMessage); // chỉ gỡ listener này
        }
        socket.emit("leaveRoom", this.target._id);
    }

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
