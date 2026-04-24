import os
import sys
import csv
import json
import copy
import time
import gzip
import random
import argparse


geo_file_path = f"./datameta.txt"
hprc_y2_sample_metadata_file_path = f"hprc_release2_sample_metadata_fixed.csv"
samples_for_portal_file_path = f"../samples.tsv"
pca_background_file_path = f"../pca_background.tsv"
pca_hprc_file_path = f"../pca_hprc.tsv"




# OLD
population_dict = {
    "Indian Telugu in the UK": {"super_population": "sas", "longitude": 78.5, "latitude": 17.4},
    "Iberian Populations in Spain": {"super_population": "eur", "longitude": -3.7, "latitude": 40.4},
    "African Ancestry in Southwest USA": {"super_population": "amr", "longitude": -112.1, "latitude": 33.4},
    "Gambian in Western Division Mandinka": {"super_population": "afr", "longitude": -15.6, "latitude": 13.4},
    "Sri Lankan Tamil in the UK": {"super_population": "sas", "longitude": 80.6, "latitude": 7.9},
    "Kinh in Ho Chi Minh City, Vietnam": {"super_population": "eas", "longitude": 106.7, "latitude": 10.8},
    "Maasai in Kinyawa, Kenya": {"super_population": "afr", "longitude": 36.8, "latitude": -1.3},
    "Esan in Nigeria": {"super_population": "afr", "longitude": 6.0, "latitude": 7.5},
    "Toscani in Italia": {"super_population": "eur", "longitude": 11.3, "latitude": 43.8},
    "African Caribbean in Barbados": {"super_population": "amr", "longitude": -59.6, "latitude": 13.2},
    "Punjabi in Lahore, Pakistan": {"super_population": "sas", "longitude": 74.3, "latitude": 31.5},
    "Han Chinese South, China": {"super_population": "eas", "longitude": 113.3, "latitude": 23.1},
    "Gujarati Indians in Houston, Texas, USA": {"super_population": "sas", "longitude": -95.4, "latitude": 29.8},
    "Yoruba in Ibadan, Nigeria": {"super_population": "afr", "longitude": 3.9, "latitude": 7.4},
    "Colombian in Medellin, Colombia": {"super_population": "amr", "longitude": -75.6, "latitude": 6.2},
    "Mexican Ancestry in Los Angeles, California, USA": {"super_population": "amr", "longitude": -118.2, "latitude": 34.1},
    "Puerto Rican in Puerto Rico": {"super_population": "amr", "longitude": -66.1, "latitude": 18.4},
    "Bengali in Bangladesh": {"super_population": "sas", "longitude": 90.4, "latitude": 23.7},
    "Japanese in Tokyo, Japan": {"super_population": "eas", "longitude": 139.7, "latitude": 35.7},
    "Gambian in Western Division � Mandinka": {"super_population": "afr", "longitude": -15.6, "latitude": 13.4},
    "Han Chinese in Beijing, China": {"super_population": "eas", "longitude": 116.4, "latitude": 39.9},
    "Finnish in Finland": {"super_population": "eur", "longitude": 25.0, "latitude": 64.0},
    "Peruvian in Lima, Peru": {"super_population": "amr", "longitude": -77.0, "latitude": -12.0},
    "British from England and Scotland": {"super_population": "eur", "longitude": -1.5, "latitude": 54.0},
    "Luhya in Webuye, Kenya": {"super_population": "afr", "longitude": 34.8, "latitude": 0.6},
    "Mende in Sierra Leone": {"super_population": "afr", "longitude": -11.8, "latitude": 8.5},
    "African Americans living in St. Louis, Missouri": {"super_population": "amr", "longitude": -90.2, "latitude": 38.6},
    "Chinese Dai in Xishuangbanna": {"super_population": "eas", "longitude": 100.8, "latitude": 21.9}
}


init = True
with open(geo_file_path) as fh:
    for l in fh:
        if init:
            init = False
            continue
        
        l = l.strip().split("\t")

        ind, pop, population, reg, region, regcolor, lat, lng, s = l
        lat = float(lat)
        lng = float(lng)
        reg = reg.lower()

        population_dict[pop] = {"super_population": reg, "longitude": lng, "latitude": lat}



sample_ids = []

with open(hprc_y2_sample_metadata_file_path) as fh:

    with open(samples_for_portal_file_path, "w") as fh2:
        xxx = csv.reader(fh, delimiter=',')
        init = True
        for row in xxx:
            if init:
                init = False

                row.append("super_population")
                row.append("longitude")
                row.append("latitude")
                fh2.write("\t".join(list(map(str, row))) + "\n")
                continue

            line = row[:]
            sample_ids.append(row[0])  # Collect sample IDs
            loc_description = row[2]
            loc_short = row[3]
            if loc_short in population_dict:
                line.append(population_dict[loc_short]["super_population"])
                line.append(population_dict[loc_short]["longitude"])
                line.append(population_dict[loc_short]["latitude"])
            else:
                line.append("")
                line.append("")
                line.append("")

            fh2.write("\t".join(list(map(str, line))) + "\n")

eigen_values = {}
with open("pca_1000g.tsv") as fh:
    for l in fh:
        l = l.strip().split()
        s = l[1]
        pc1 = float(l[2])
        pc2 = float(l[3])
        eigen_values[s] = (pc1, pc2)



# Generate PCA data for HPRC samples
with open(pca_hprc_file_path, "w") as fh:
    fh.write("sample_id\tx\ty\n")
    for sample_id in sample_ids:
        # Generate random coordinates for each sample
        if sample_id in eigen_values:
            x, y = eigen_values[sample_id]
            fh.write(f"{sample_id}\t{x}\t{y}\n")
            del eigen_values[sample_id]


# Generate PCA background data (~1000 random points)
with open(pca_background_file_path, "w") as fh:
    fh.write("id\tx\ty\n")
    for k,v in eigen_values.items():
        # Generate random coordinates similar to PCA plot range (-0.15 to 0.15)
        x, y = v
        fh.write(f"{k}\t{x}\t{y}\n")





if __name__ == '__main__':
    pass
