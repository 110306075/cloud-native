import db from "../../../models/index.js";

const {
  UserCourse,
  User,
  Course,
  Assignment,
  Submission,
  Exam,
  Question,
  TestCase,
  sequelize,
} = db;
import { Sequelize, Op } from "sequelize";

export const getAssignmentsAndExams = async (req, res) => {
  try {
    const { courseID } = req.params;
    const isDeleted = await Course.findOne({
      where: { ID: courseID, DeletedAt: { [Op.ne]: null } },
    });
    if (isDeleted) {
      return res.status(500).json({ error: "The course has been deleted." });
    }

    const assignments = await Assignment.findAll({
      where: { CourseID: courseID, DeletedAt: null },
      attributes: [
        "ID",
        "Name",
        "DueDate",
        "Description",
        "StartDate",
        [
          Sequelize.fn("COUNT", Sequelize.col("Questions.ID")),
          "question_count",
        ],
      ],
      include: [
        {
          model: Course,
          attributes: ["ID", "Name"],
          where: { DeletedAt: null },
        },
        {
          model: Question,
          attributes: [],
          required: false,
          where: { DeletedAt: null },
        },
      ],
      group: ["Assignment.ID", "Course.ID"],
      raw: false,
    });

    const formattedAssignments = assignments.map((assignment) => ({
      id: assignment.ID,
      name: assignment.Name,
      due_date: assignment.DueDate,
      start_date: assignment.StartDate,
      description: assignment.Description,
      question_count: assignment.dataValues.question_count || 0,
      course: {
        id: assignment.Course.ID,
        course_name: assignment.Course.Name,
      },
    }));

    const exams = await Exam.findAll({
      where: { CourseID: courseID, DeletedAt: null },
      attributes: ["ID", "Name", "StartDate", "DueDate", "Description"],
      include: [
        {
          model: Course,
          attributes: ["ID", "Name"],
          where: { DeletedAt: null },
        },
      ],
    });

    const formattedExams = exams.map((exam) => ({
      id: exam.ID,
      name: exam.Name,
      start_date: exam.StartDate,
      due_date: exam.DueDate,
      description: exam.Description,
      course: {
        id: exam.Course.ID,
        name: exam.Course.Name,
      },
    }));

    res.status(200).json({
      assignments: formattedAssignments,
      exams: formattedExams,
    });
  } catch (error) {
    console.error("Error fetching assignments and exams:", error);
    res.status(500).json({ error: "Failed to fetch assignments and exams" });
  }
};

export const createAssignment = async (req, res) => {
  try {
    const { courseID } = req.params;
    const { assignment_name, due_date, description, start_date } = req.body;
    const teacherID = req.user.id;

    if (start_date > due_date) {
      return res
        .status(400)
        .json({ error: "start_date have to less than due_date." });
    }

    const isTeacher = await User.findOne({
      where: { ID: teacherID, DeletedAt: null, Type: "teacher" },
    });
    const course = await Course.findOne({
      where: { ID: courseID, DeletedAt: null },
      include: [
        {
          model: UserCourse,
          where: { UserID: teacherID, DeletedAt: null },
        },
      ],
    });
    if (!(course && isTeacher)) {
      return res.status(403).json({
        error:
          "You are not authorized to add assignments to this course or the course does not exist.",
      });
    }

    const existingAssignment = await Assignment.findOne({
      where: {
        CourseID: courseID,
        Name: assignment_name,
        DeletedAt: null,
      },
    });

    if (existingAssignment) {
      return res.status(400).json({
        error:
          "An assignment with the same name already exists in this course.",
      });
    }

    const newAssignment = await Assignment.create({
      Name: assignment_name,
      DueDate: new Date(due_date),
      StartDate: new Date(start_date),
      Description: description,
      CourseID: courseID,
    });
    res.status(201).end();
  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(500).json({ error: "Failed to create assignment." });
  }
};

export const deleteAssignment = async (req, res) => {
  const transaction = await Assignment.sequelize.transaction(); // Start a transaction

  try {
    const { assignmentID } = req.params;
    const assignmentResult = await Assignment.update(
      { DeletedAt: Sequelize.fn("NOW") },
      { where: { ID: assignmentID, DeletedAt: null }, transaction: transaction }
    );

    if (assignmentResult[0] === 0) {
      await transaction.rollback();
      return res
        .status(500)
        .json({ error: "error occur when deleting assignment." });
    }

    await Question.update(
      { DeletedAt: Sequelize.fn("NOW") },
      {
        where: { AssignmentID: assignmentID, DeletedAt: null },
        transaction: transaction,
      }
    );

    await transaction.commit();
    res.status(200).end();
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting assignment:", error);
    return res
      .status(500)
      .json({ error: "error occur when deleting assignment." });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const { assignmentID } = req.params;
    const updatedData = req.body;

    const excludedFields = [
      "ID",
      "CreatedAt",
      "DeletedAt",
      "UpdatedAt",
      "CourseID",
    ];

    const filteredData = {};
    Object.keys(updatedData).forEach((key) => {
      if (!excludedFields.includes(key)) {
        filteredData[key] = updatedData[key];
      }
    });

    filteredData.UpdatedAt = new Date();

    const [affectedRows] = await Assignment.update(filteredData, {
      where: { ID: assignmentID, DeletedAt: null },
    });

    if (affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "assignment not found or already deleted." });
    }

    return res
      .status(200)
      .json({ message: "assignment updated successfully." });
  } catch (error) {
    console.error("Error updating assignment:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating the assingment." });
  }
};
