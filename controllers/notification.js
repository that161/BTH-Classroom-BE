const crypto = require("crypto");
require("dotenv").config();
const Notification = require("../model/notification");


const getAllNotify = async (req, res) => {
    try {
        const userId = req.user._id;

        const notifications = await Notification.find({ receiverId: userId })
            .sort({ createdAt: -1 })
            .populate('senderId', ['fullname', 'avatar'])
            .populate('objectId')

        const unreadCount = notifications.filter(notification => !notification.isRead).length;

        res.status(200).json({
            success: true,
            data: {
                unreadCount,
                notifications,
            },
        });

    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};

const markNotificationAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const { notificationId } = req.params;

        // Tìm thông báo dựa trên notificationId và receiverId
        const notification = await Notification.findOne({
            _id: notificationId,
            receiverId: userId,
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        // Đánh dấu thông báo là đã đọc
        notification.isRead = true;
        await notification.save();

        const notifications = await Notification.find({ receiverId: userId })
            .sort({ createdAt: -1 })
            .populate('senderId', 'fullname')
            .populate('objectId')

        const unreadCount = notifications.filter(notification => !notification.isRead).length;

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: {
                unreadCount,
                notifications,
            },
        });

    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};

const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user._id;

        // Cập nhật tất cả thông báo của người dùng thành đã đọc
        await Notification.updateMany({ receiverId: userId }, { $set: { isRead: true } });

        // Lấy lại danh sách thông báo sau khi cập nhật
        const notifications = await Notification.find({ receiverId: userId })
            .sort({ createdAt: -1 })
            .populate('senderId', ['fullname', 'avatar'])
            .populate('objectId');

        const unreadCount = 0; // Đã đọc hết nên đặt số lượng chưa đọc là 0

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
            data: {
                unreadCount,
                notifications,
            },
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};


module.exports = {
    getAllNotify,
    markNotificationAsRead,
    markAllNotificationsAsRead
};
