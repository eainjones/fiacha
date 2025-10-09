
import csv

def calculate_motion_totals(motions_cleaned_file, output_file):
    councillor_totals = {}

    with open(motions_cleaned_file, 'r') as f_in:
        reader = csv.reader(f_in)
        header = next(reader)
        for row in reader:
            councillor = row[0]
            role = row[1]
            count = int(row[2])

            if councillor not in councillor_totals:
                councillor_totals[councillor] = {'proposed': 0, 'seconded': 0}

            if role == 'proposer':
                councillor_totals[councillor]['proposed'] += count
            elif role == 'seconder':
                councillor_totals[councillor]['seconded'] += count

    with open(output_file, 'w', newline='') as f_out:
        writer = csv.writer(f_out)
        writer.writerow(['councillor', 'total_proposed', 'total_seconded'])
        for councillor, totals in councillor_totals.items():
            writer.writerow([councillor, totals['proposed'], totals['seconded']])

calculate_motion_totals(
    '/Users/eainjones/Documents/GitHub/fiacha/data/wexford/structured/motions_cleaned.csv',
    '/Users/eainjones/Documents/GitHub/fiacha/data/wexford/structured/motion_totals.csv'
)

print("Motion totals written to /Users/eainjones/Documents/GitHub/fiacha/data/wexford/structured/motion_totals.csv")
