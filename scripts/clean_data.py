
import csv

def clean_motions_data(canonical_file, variations_file, motions_file, output_file):
    canonical_names = set()
    with open(canonical_file, 'r') as f_in:
        reader = csv.reader(f_in)
        header = next(reader)
        for row in reader:
            canonical_names.add(row[0])

    variations = {}
    with open(variations_file, 'r') as f_in:
        reader = csv.reader(f_in)
        header = next(reader)
        for row in reader:
            variations[row[0]] = row[1]

    with open(motions_file, 'r') as f_in, open(output_file, 'w', newline='') as f_out:
        reader = csv.reader(f_in)
        writer = csv.writer(f_out)
        header = next(reader)
        writer.writerow(header)

        for row in reader:
            raw_name = row[0]
            if raw_name in variations:
                row[0] = variations[raw_name]
            writer.writerow(row)

clean_motions_data(
    '/Users/eainjones/Documents/GitHub/fiacha/data/wexford/structured/councillors_canonical.csv',
    '/Users/eainjones/Documents/GitHub/fiacha/data/wexford/structured/councillor_name_variations.csv',
    '/Users/eainjones/Documents/GitHub/fiacha/data/wexford/structured/motions.csv',
    '/Users/eainjones/Documents/GitHub/fiacha/data/wexford/structured/motions_cleaned.csv'
)

print("Cleaned motions data written to /Users/eainjones/Documents/GitHub/fiacha/data/wexford/structured/motions_cleaned.csv")
