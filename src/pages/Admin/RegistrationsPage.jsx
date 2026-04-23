import { motion } from "framer-motion";

import Header from "../../components/Admin/common/Header";
import React from "react";

import RegistrationsTable from "../../components/Admin/products/RegistrationsTable";

const RegistrationsPage = () => {
	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Quản lý Đăng ký' />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				<RegistrationsTable />
			</main>
		</div>
	);
};
export default RegistrationsPage;
