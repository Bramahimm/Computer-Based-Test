
import React from 'react'
import { Head, useForm } from '@inertiajs/react'
import { UserIcon, LockClosedIcon } from '@heroicons/react/24/solid'

import Input from '@/Components/UI/Input'
import Button from '@/Components/UI/Button'

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
    login: '',
    password: '',
    remember: false,
})


    const submit = (e) => {
        e.preventDefault()
        post(route('login'))
    }

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-slate-100 to-slate-200 font-sans">
            <Head title="Login CBT FK Unila" />
            {/* ================= LEFT ================= */}
            <div className="relative hidden lg:flex items-center justify-center overflow-hidden">
                <img
                    src="/images/fk.jpg"
                    alt="Fakultas Kedokteran Unila"
                    className="absolute inset-0 w-full h-full object-cover scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/90 via-emerald-800/80 to-slate-900/90" />

                <div className="relative z-10 max-w-xl px-16 text-white">
                    <h1 className="text-5xl font-semibold leading-tight">
                        Computer<br />Based Test
                    </h1>
                    <div className="mt-5 h-1.5 w-24 bg-emerald-400 rounded-full" />
                    <p className="mt-6 text-emerald-100">
                        Platform ujian terkomputerisasi Fakultas Kedokteran
                        Universitas Lampung
                    </p>
                </div>
            </div>

            {/* ================= RIGHT ================= */}
            <div className="flex items-center justify-center px-6">
                <div className="w-full max-w-md rounded-3xl bg-white/80 backdrop-blur-xl border shadow-xl">
                    <div className="px-10 pt-10 text-center">
                        <img
                            src="/images/logo.png"
                            alt="Universitas Lampung"
                            className="mx-auto w-20 mb-4"
                        />
                        <h2 className="text-2xl font-semibold text-slate-800">
                            Login CBT
                        </h2>
                        <p className="text-sm text-slate-500">
                            Fakultas Kedokteran Universitas Lampung
                        </p>
                    </div>

                    <form onSubmit={submit} className="px-10 py-8 space-y-6">
                        <Input
                            label="Email / NPM"
                            value={data.login}
                            onChange={e => setData('login', e.target.value)}
                            error={errors.login}
                            placeholder="Email atau NPM"
                        />

                        <Input
                            label="Password"
                            type="password"
                            icon={LockClosedIcon}
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            error={errors.password}
                            placeholder="Masukkan password"
                        />

                        <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={e => setData('remember', e.target.checked)}
                                className="rounded border-slate-300 text-emerald-600"
                            />
                            Remember me
                        </label>

                        <Button
                            type="submit"
                            isLoading={processing}
                            className="w-full py-3 text-white rounded-xl bg-emerald-600 hover:bg-emerald-700"
                        >
                            Masuk
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
