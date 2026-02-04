<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Hasil Ujian</title>
    <style>
        /* Reset & Base Styling untuk PDF */
        body {
            font-family: sans-serif; /* Font standar agar terbaca di semua OS */
            font-size: 11px;
            color: #333;
        }

        /* Header Laporan */
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .header h2 {
            margin: 0;
            font-size: 18px;
            text-transform: uppercase;
        }
        .header p {
            margin: 5px 0 0;
            font-size: 10px;
            color: #555;
        }

        /* Tabel Data */
        table {
            width: 100%;
            border-collapse: collapse; /* Agar garis tabel menyatu */
            margin-top: 10px;
        }
        th, td {
            border: 1px solid #444;
            padding: 6px 8px;
            text-align: left;
            vertical-align: middle;
        }
        th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 10px;
        }

        /* Styling Khusus Kolom */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-mono { font-family: 'Courier New', Courier, monospace; } /* Untuk NPM/Waktu */
        
        /* Status Badges (Text Only di PDF lebih aman daripada Background color) */
        .status-finished { color: #059669; font-weight: bold; } /* Hijau */
        .status-locked { color: #dc2626; font-weight: bold; }   /* Merah */
        .status-ongoing { color: #d97706; font-weight: bold; }  /* Orange */

        /* Nilai */
        .score {
            font-weight: bold;
            font-size: 12px;
        }

        /* Footer Halaman */
        .footer {
            position: fixed;
            bottom: -30px;
            left: 0px;
            right: 0px;
            height: 50px;
            font-size: 9px;
            color: #999;
            text-align: center;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }
        
        /* Page Numbering (Opsional, support dompdf) */
        .page-number:before {
            content: counter(page);
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Laporan Hasil Ujian</h2>
        <p>Dicetak pada: {{ \Carbon\Carbon::now()->locale('id')->isoFormat('dddd, D MMMM Y HH:mm') }} WIB</p>
    </div>

    <table>
        <thead>
            <tr>
                <th width="5%" class="text-center">No</th>
                <th width="15%">NPM</th>
                <th width="25%">Nama Peserta</th>
                <th width="20%">Mata Ujian</th>
                <th width="12%">Selesai</th>
                <th width="13%" class="text-center">Status</th>
                <th width="10%" class="text-center">Nilai</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data as $index => $item)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td class="font-mono">
                    {{ $item->user->npm ?? '-' }}
                </td>
                <td>
                    <strong>{{ $item->user->name }}</strong><br>
                    <small style="color: #666;">{{ $item->user->email }}</small>
                </td>
                <td>{{ $item->test->title }}</td>
                <td class="font-mono" style="font-size: 10px;">
                    {{ $item->finished_at ? \Carbon\Carbon::parse($item->finished_at)->format('d/m/y H:i') : '-' }}
                </td>
                <td class="text-center">
                    @if($item->is_locked)
                        <span class="status-locked">DIKUNCI</span>
                    @elseif($item->status == 'submitted' || $item->status == 'finished')
                        <span class="status-finished">SELESAI</span>
                    @elseif($item->status == 'ongoing')
                        <span class="status-ongoing">AKTIF</span>
                    @else
                        <span>{{ strtoupper($item->status) }}</span>
                    @endif
                </td>
                <td class="text-center score">
                    {{ $item->custom_score ?? ($item->result->total_score ?? '0.00') }}
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" class="text-center" style="padding: 20px;">Data tidak ditemukan.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Dokumen ini digenerate otomatis oleh sistem CBT. Tanda tangan basah tidak diperlukan.<br>
        Halaman <span class="page-number"></span>
    </div>
</body>
</html>