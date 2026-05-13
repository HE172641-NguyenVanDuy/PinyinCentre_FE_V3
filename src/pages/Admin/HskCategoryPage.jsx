import React from 'react';
import Header from "../../components/Admin/common/Header";
import HskCategoryTable from '../../components/Admin/products/HskCategoryTable';

const HskCategoryPage = () => {
    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <Header title='Quản lý HSK Categories' />
            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                <HskCategoryTable />
            </main>
        </div>
    );
};

export default HskCategoryPage;
