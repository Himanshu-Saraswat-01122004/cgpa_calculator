import mongoose, { Schema, Document } from 'mongoose';

const CourseSchema = new Schema({
    courseName: { type: String, required: true },
    credits: { type: Number, required: true },
    grade: { type: String, required: true },
});

const SemesterSchema = new Schema({
    semesterName: { type: String, required: true },
    courses: [CourseSchema],
});

export interface IUser extends Document {
    email: string;
    password?: string;
    semesters: {
        _id?: mongoose.Types.ObjectId;
        semesterName: string;
        courses: {
            _id?: mongoose.Types.ObjectId;
            courseName: string;
            credits: number;
            grade: string;
        }[];
    }[];
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    semesters: [SemesterSchema],
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
