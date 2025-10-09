
# Fiacha - Irish Political Promise Tracker

This project is a prototype for an Irish Political Promise Tracker. It aims to provide a platform to track the promises made by politicians and their fulfillment.

## Data Cleaning

A significant challenge in this project is the regulation of councillor names, as they are often recorded in various formats in the raw data. To address this, a mechanism has been created to clean and standardize councillor names.

This mechanism consists of three main components:

1.  **Canonical Councillor List:** A canonical list of all councillors is maintained in the file `data/wexford/structured/councillors_canonical.csv`. This file should be manually updated when there are changes in the council.

2.  **Name Variation Mapping:** A mapping of all known variations of a councillor's name to their canonical name is maintained in the file `data/wexford/structured/councillor_name_variations.csv`. This file is used by the cleaning script to standardize the names.

3.  **Data Cleaning Script:** A Python script, `scripts/clean_data.py`, uses the canonical list and the name variations to clean the raw data. The script reads the raw data, replaces the name variations with the canonical names, and writes the cleaned data to a new file.

### How to Use the Cleaning Script

To use the cleaning script, run the following command from the root of the project:

```
python3 scripts/clean_data.py
```

This will clean the `motions.csv` file and create a new file `motions_cleaned.csv` with the standardized councillor names.

### Motion Count Discrepancy

There is a known discrepancy in the motion counts between the `summary_top_motions.csv` file and the cleaned data. This is due to some unmapped name variations in the `councillor_name_variations.csv` file.

To get 100% accuracy, the remaining unmapped labels need to be manually mapped to their canonical names.

## Next Steps

1.  **Complete the Councillor Name Mapping:** Manually map the remaining unmapped labels in `councillor_name_variations.csv` to their canonical names. This will improve the accuracy of the motion counts.

2.  **Re-run the Cleaning and Calculation Scripts:** After updating the name variations, re-run the `scripts/clean_data.py` and `scripts/calculate_motion_totals.py` scripts to get the final, accurate motion counts.

3.  **Update the Summary Files:** Once the motion counts are accurate, update the `summary_top_motions.csv` file with the correct data.

4.  **Automate the Data Pipeline:** Integrate the cleaning script into the data pipeline to automatically clean new data as it is added.

5.  **Address Other TODOs:** Move on to the other TODO items, such as validating motion counts by sampling linked minutes and deciding on the evidence cache.
