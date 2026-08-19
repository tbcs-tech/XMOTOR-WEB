#!/usr/bin/env python3
"""
Wire the dealer bulk-upload UI into the web app.

The page component itself (src/app/dashboard/dealer/bulk-upload/page.tsx) is a
new file and ships as-is. This patches the two existing files that need to
reference it, rather than overwriting them:

    1. src/lib/api.ts                      adds the `bulk` client
    2. src/app/dashboard/dealer/page.tsx   adds the Bulk Upload button

Idempotent. Backs up before writing.

    python patch_bulk_ui.py            # report only
    python patch_bulk_ui.py --apply

Run from the xmotor-web repo root.
"""
import os
import re
import sys
import shutil

ROOT = os.getcwd()
API = os.path.join(ROOT, 'src', 'lib', 'api.ts')
DEALER = os.path.join(ROOT, 'src', 'app', 'dashboard', 'dealer', 'page.tsx')
APPLY = '--apply' in sys.argv


BULK_CLIENT = '''// ── Dealer Bulk Import ────────────────────────────────────────────────────

export interface BulkRow {
  _row_num: number
  _status: 'ok' | 'warning' | 'error'
  _errors: string[]
  _warnings: string[]
  _images: { key: string; slot: string | null }[]
  stock_id: string
  title: string
  make: string
  model: string
  variant: string
  year: number | null
  price: number | null
  mileage: number | null
  fuel_type: string
  transmission: string
  body_type: string
  city: string
}

export interface BulkBatch {
  id: number
  filename: string
  status: 'draft' | 'committed' | 'discarded'
  total_rows: number
  valid_rows: number
  warn_rows: number
  error_rows: number
  image_count: number
  created_at: string
  committed_at: string | null
  rows?: BulkRow[]
}

export const bulk = {
  templateUrl: () => `${API_BASE}/api/v1/dealer/bulk/template`,

  /** Parse and validate only — creates no listings. */
  upload: async (sheet: File, photos?: File | null) => {
    const fd = new FormData()
    fd.append('sheet', sheet)
    if (photos) fd.append('photos', photos)
    const res = await fetch(`${API_BASE}/api/v1/dealer/bulk/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getAccessToken()}` },
      body: fd,
    })
    const data = await res.json()
    if (!res.ok) throw { status: res.status, data }
    return data as {
      batch: BulkBatch
      summary: { total: number; ok: number; warning: number; error: number }
      unmatched_photos: string[]
      unmatched_count: number
    }
  },

  get: (id: number) => apiFetch<{ batch: BulkBatch }>(`/dealer/bulk/${id}`),

  commit: (id: number, skipStockIds: string[] = []) =>
    apiFetch<{ message: string; created: number; skipped: number; vehicle_ids: number[] }>(
      `/dealer/bulk/${id}/commit`,
      { method: 'POST', body: JSON.stringify({ skip_stock_ids: skipStockIds }) }
    ),

  discard: (id: number) =>
    apiFetch<{ message: string }>(`/dealer/bulk/${id}/discard`, { method: 'POST' }),

  list: () => apiFetch<{ batches: BulkBatch[] }>('/dealer/bulk'),
}

'''


def main():
    done, skipped, problems = [], [], []

    if not os.path.exists(API):
        print(f'Run this from the xmotor-web repo root ({API} not found).')
        sys.exit(1)

    api_src = open(API, encoding='utf-8').read()
    dealer_src = open(DEALER, encoding='utf-8').read() if os.path.exists(DEALER) else None

    # ── 1. api.ts ──
    if 'export const bulk' in api_src:
        skipped.append('api.ts bulk client (present)')
    else:
        m = re.search(r'^const api = \{([^}]*)\}', api_src, re.MULTILINE)
        if not m:
            problems.append('api.ts: could not find the `const api = { ... }` line')
        else:
            names = [n.strip() for n in m.group(1).split(',') if n.strip()]
            if 'bulk' not in names:
                names.append('bulk')
            new_line = 'const api = { ' + ', '.join(names) + ' }'
            api_src = (api_src[:m.start()] + BULK_CLIENT + new_line
                       + api_src[m.end():])
            done.append('api.ts bulk client')

    # ── 2. dealer dashboard button ──
    if dealer_src is None:
        problems.append('dealer/page.tsx not found')
    elif 'bulk-upload' in dealer_src:
        skipped.append('dealer dashboard button (present)')
    else:
        anchor = re.search(
            r'(\s*)<Link href="/dashboard/dealer/add-vehicle">\s*\n'
            r'\s*<Button[^>]*>.*?</Button>\s*\n'
            r'\s*</Link>', dealer_src, re.DOTALL)
        if not anchor:
            problems.append('dealer/page.tsx: Add Vehicle link not found — '
                            'add the Bulk Upload link by hand')
        else:
            indent = anchor.group(1).lstrip('\n')
            insert = (anchor.group(0) + '\n' + indent
                      + '<Link href="/dashboard/dealer/bulk-upload">\n' + indent
                      + '  <Button size="sm" variant="secondary">'
                        '<Upload className="w-4 h-4" /> Bulk Upload</Button>\n'
                      + indent + '</Link>')
            dealer_src = dealer_src.replace(anchor.group(0), insert, 1)

            # make sure Upload is imported from lucide-react
            im = re.search(r"import \{([^}]*)\} from 'lucide-react'",
                           dealer_src, re.DOTALL)
            if im and 'Upload' not in im.group(1):
                icons = [i.strip() for i in im.group(1).replace('\n', ' ').split(',')
                         if i.strip()]
                icons.append('Upload')
                dealer_src = (dealer_src[:im.start()]
                              + 'import {\n  ' + ', '.join(icons)
                              + ',\n} from \'lucide-react\''
                              + dealer_src[im.end():])
            done.append('dealer dashboard Bulk Upload button')

    print()
    print('═══ Wire bulk upload UI ═══')
    for d in done:
        print(('  applied      ' if APPLY else '  will apply   ') + d)
    for s in skipped:
        print('  skipped      ' + s)
    for p in problems:
        print('  PROBLEM      ' + p)
    print()

    if problems:
        print('Resolve the problems above first; nothing was written.')
        sys.exit(1)
    if not done:
        print('Nothing to do.')
        return
    if not APPLY:
        print('Report only. Re-run with --apply to write changes.')
        return

    shutil.copy(API, API + '.bulk.bak')
    open(API, 'w', encoding='utf-8').write(api_src)
    if dealer_src is not None:
        shutil.copy(DEALER, DEALER + '.bulk.bak')
        open(DEALER, 'w', encoding='utf-8').write(dealer_src)

    print('Written. Backups alongside each file (*.bulk.bak).')
    print()
    print('Then:  npm run build')


if __name__ == '__main__':
    main()
