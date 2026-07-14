const Task = require("../models/task.model");


// GET /api/tasks
exports.getAllTasks = (req, res) => {

    Task.getAllTasks((err, results) => {

        if (err) {
            console.error("Lỗi lấy danh sách task:", err);

            return res.status(500).json({
                success: false,
                message: "Lỗi database"
            });
        }


        res.json({
            success: true,
            data: results
        });

    });

};



// GET /api/tasks/:id
exports.getTaskById = (req, res) => {

    const { id } = req.params;


    Task.getTaskById(id, (err, results) => {

        if (err) {
            console.error("Lỗi lấy task:", err);

            return res.status(500).json({
                success: false,
                message: "Lỗi database"
            });
        }


        if (results.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Không tìm thấy task"
            });

        }


        res.json({
            success: true,
            data: results[0]
        });

    });

};



// POST /api/tasks
exports.createTask = (req, res) => {

    const {
        title,
        description,
        status,
        deadline,
        board_id
    } = req.body;



    // Validate title
    if (!title || title.trim() === "") {

        return res.status(400).json({
            success: false,
            message: "Tiêu đề task không được để trống!"
        });

    }



    // Validate board
    if (!board_id) {

        return res.status(400).json({
            success: false,
            message: "board_id là bắt buộc!"
        });

    }



    const taskData = {

        title: title.trim(),

        description: description || null,

        status: status || "To Do",

        deadline: deadline || null,

        board_id

    };



    Task.createTask(taskData, (err, results) => {


        if (err) {

            console.error("Lỗi tạo task:", err);


            return res.status(500).json({
                success: false,
                message: "Lỗi database"
            });

        }



        res.status(201).json({

            success: true,

            message: "Tạo task thành công!",

            data: {

                task_id: results.insertId,

                ...taskData

            }

        });


    });


};
// PUT /api/tasks/:id
exports.updateTask = (req, res) => {

    const { id } = req.params;

    const {
        title,
        description,
        status,
        deadline
    } = req.body;


    const taskData = {
        title,
        description,
        status,
        deadline
    };


    Task.updateTask(id, taskData, (err, results) => {

        if (err) {
            console.error("Lỗi update task:", err);

            return res.status(500).json({
                success: false,
                message: "Lỗi database"
            });
        }


        if (results.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Không tìm thấy task"
            });

        }


        res.json({
            success: true,
            message: "Cập nhật task thành công!"
        });

    });

};