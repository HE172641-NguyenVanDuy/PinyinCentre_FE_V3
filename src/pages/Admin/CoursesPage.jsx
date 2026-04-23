import { motion } from "framer-motion";
import Header from "../../components/Admin/common/Header";
import React from "react";
import CourseTable from "../../components/Admin/products/CourseTable";

const CoursesPage = () => {
	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Quản lý Khóa học' />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				<CourseTable />
			</main>
		</div>
	);
};
export default CoursesPage;
