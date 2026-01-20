import React, { useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';

export default function Index() {
    const { flash } = usePage().props;

    useEffect(() => {
        router.visit(route('admin.users.index', { section: 'groups' }), {
            replace: true,
        });
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-green-600 font-bold">
            Menyelaraskan Data...
        </div>
    );
}