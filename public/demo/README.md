# Demo vehicle photography

Two complete sets, each backing one seeded listing. Served statically by
Next.js from `/demo/...`, so no R2 upload is needed.

| Folder | Listing |
|---|---|
| `maruti-dzire/` | 2022 Maruti Suzuki Dzire VXi AMT — Silky Silver |
| `honda-accord/` | 2021 Honda Accord VX CVT Petrol — Lunar Silver Metallic |

**Known issue:** the Honda interior and dashboard shots are left-hand drive,
which is wrong for the Indian market. The Dzire set is correctly right-hand
drive. Worth regenerating the Honda cabin shots with "right-hand drive,
steering wheel on the right" in the prompt.

## Required angles

front · rear · left · right · interior · dashboard · engine

Filenames must match exactly (`front.jpg`, `rear.jpg`, …). Anything missing
falls back to the drawn `VehicleAngle` illustration for that slot, so a partial
set still renders sensibly.

## Adding another car

1. Produce the seven angles. Keep one vehicle, one colour, one background
   across the whole set — mismatched lighting reads as stock photos.
2. Save as JPEG, roughly 1500×670, quality ~86, under ~200 KB each.
3. Drop them in `public/demo/<make>-<model>/`.
4. In `app/__init__.py`, add a prefix beside `DEMO_CAR` and point a seed
   vehicle's `images` dict at it.

## Two rules that matter

**The listing must match the photograph.** These images show a Honda with
visible badging. Attaching them to a listing titled "Maruti Swift" is
misrepresentation, and on a marketplace that liability sits with the platform,
not the seller.

**Clear these before real inventory goes live.** They are demo assets.

    .venv/bin/python deploy/reset_demo_images.py --dry-run

## Generation prompt pattern

If you are generating these, the studio look here comes from holding the
setting constant and changing only the camera position:

> Studio photograph of a silver <make> <model> sedan on a white cyclorama with
> a polished grey floor and a faint circular turntable marking, even diffuse
> lighting, no people, no text. Camera: **<angle>**.

Angles: direct front · direct rear · full left profile · full right profile ·
interior from rear seat toward dashboard · close-up of instrument cluster and
steering wheel · open bonnet showing engine bay.

Check the output before shipping it: generated interiors often contain garbled
dial text, and a wrong badge on the grille is worse than no photo at all.
