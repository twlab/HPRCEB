# HPRC Year 2 Data Source Files

This directory contains the **human-editable source data** in TSV format. These files are converted to JSON for the browser portal.

## 📁 Files

### `samples.tsv`
**Sample-level metadata** - One line per genome sample

**Columns:**
- `sample_id`: Unique identifier (e.g., HG002, NA18906)
- `sample_name`: Full descriptive name
- `super_population`: Population code (afr, amr, eas, eur, sas)
- `sex`: Biological sex (male, female)
- `tissue`: Source tissue (e.g., blood)
- `sequencing_center`: Sequencing center (WUSTL, UW, UCSC, etc.)
- `assembly_quality`: Quality tier (high, medium, low)
- `contig_n50_mb`: Contig N50 in megabases
- `notes`: Any additional notes

### `tracks.tsv`
**Data tracks** - One line per data track (allows multiple tracks per sample)

**Columns:**
- `sample_id`: Links to sample in samples.tsv
- `data_type`: Type of data (assembly, methylation, expression, fiberseq)
- `size_gb`: File size in gigabytes
- `platform`: Sequencing platform (e.g., PacBio HiFi, Illumina NovaSeq, ONT)
- `processing_tool`: Tool used for processing (e.g., hifiasm, Bismark, STAR)
- `file_format`: File format (FASTA, BAM, bedMethyl, TSV, etc.)
- `release_date`: Release date (YYYY-MM-DD)
- `notes`: Any additional notes
- `browser`: **JSON string** containing browser-specific metadata:
  - `name`: Display name for the track (e.g., "HG002 WGBS Methylation")
  - `trackType`: Track classification (e.g., "CpG methylation", "Assembly")
  - `genome`: Reference genome (hg38, chm13, mat, pat)
  - `url`: Download URL for the file

## 🔄 Workflow

### 1. Edit TSV Files
Edit the TSV files using:
- Excel, LibreOffice, or Google Sheets
- Text editor (ensure tab-delimited format)
- Python/R scripts

**Tips:**
- Keep one header row
- Use tabs (not spaces) as delimiters
- Don't use tabs or newlines within cells
- UTF-8 encoding recommended

### 2. Build JSON
Run the conversion script:

```bash
cd data_source
python build_data.py
```

This generates: `../public/data/genomes.json`

### 3. Test Portal
Start the development server to see your changes:

```bash
cd ..
npm run dev
```

## 📝 Adding New Data

### Add a New Sample

1. Add a line to `samples.tsv` with the sample metadata
2. Add corresponding tracks to `tracks.tsv`
3. Run `python build_data.py`

Example:
```tsv
# samples.tsv
HG003	HG003 (Ashkenazi Trio Father)	eur	male	blood	WUSTL	high	46.2	Ashkenazi Jewish trio - father
```

### Add a New Track

Add a line to `tracks.tsv`:

```tsv
# tracks.tsv
HG003	assembly	3.15	PacBio HiFi	hifiasm v0.19	primary	FASTA	2024-03-01	https://...	Notes
HG003	methylation	15.5	Illumina NovaSeq	Bismark v0.24	CpG sites	bedMethyl	2024-03-05	https://...	WGBS 35x
```

### Add a New Data Type

1. Add tracks with the new `data_type` in `tracks.tsv`
2. Update `build_data.py` to handle the new type:
   - Add to `data_tracks` dictionary
   - Update portal UI in `front/index.html` and `front/src/`

Example for Hi-C:
```tsv
# tracks.tsv
HG002	hic	12.5	Dovetail Omni-C	Juicer v1.6	contact matrix	.hic	2024-02-15	https://...	Chromatin contacts
```

## 🔍 Data Validation

Before building, you can validate your TSV files:

```bash
# Check for tab consistency
python -c "
import csv
with open('samples.tsv') as f:
    reader = csv.DictReader(f, delimiter='\t')
    for i, row in enumerate(reader, 2):
        print(f'Row {i}: {row[\"sample_id\"]}')
"

# Check for orphaned tracks (tracks without samples)
python -c "
import csv
samples = set()
with open('samples.tsv') as f:
    reader = csv.DictReader(f, delimiter='\t')
    samples = {row['sample_id'] for row in reader}

with open('tracks.tsv') as f:
    reader = csv.DictReader(f, delimiter='\t')
    for row in reader:
        if row['sample_id'] not in samples:
            print(f'Warning: Track for unknown sample {row[\"sample_id\"]}')
"
```

## 📊 Track Metadata Examples

### Assembly (single reference)
```tsv
HG002	assembly	3.1	PacBio HiFi	hifiasm v0.19	FASTA	2024-01-15	Phased assembly	{"name": "HG002 Assembly", "trackType": "Assembly", "genome": "hg38", "url": "https://example.com/HG002/assembly.fa.gz"}
```

### Assembly (phased - mat/pat)
```tsv
HG003	assembly	3.0	PacBio HiFi	hifiasm v0.19	FASTA	2024-01-15	Maternal haplotype	{"name": "HG003 Assembly Mat", "trackType": "Assembly", "genome": "mat", "url": "https://example.com/HG003/assembly.mat.fa.gz"}
HG003	assembly	3.0	PacBio HiFi	hifiasm v0.19	FASTA	2024-01-15	Paternal haplotype	{"name": "HG003 Assembly Pat", "trackType": "Assembly", "genome": "pat", "url": "https://example.com/HG003/assembly.pat.fa.gz"}
```

### DNA Methylation (WGBS)
```tsv
HG002	methylation	15.2	Illumina NovaSeq	Bismark v0.24	bedMethyl	2024-01-20	WGBS 30x coverage	{"name": "HG002 WGBS Methylation", "trackType": "CpG methylation", "genome": "hg38", "url": "https://example.com/HG002/methylation.bed.gz"}
```

### DNA Methylation (Nanopore)
```tsv
HG002	methylation	12.8	ONT PromethION	modkit v0.2	bedMethyl	2024-01-20	Native modification	{"name": "HG002 ONT Methylation", "trackType": "5mC calls", "genome": "hg38", "url": "https://example.com/HG002/methylation.ont.bed.gz"}
```

### Expression
```tsv
HG002	expression	8.5	Illumina NovaSeq	STAR/RSEM	TSV	2024-01-18	Poly-A RNA-seq	{"name": "HG002 Gene Expression", "trackType": "RNA-seq", "genome": "hg38", "url": "https://example.com/HG002/expression.tsv.gz"}
```

### Fiber-seq
```tsv
HG002	fiberseq	19.8	PacBio Revio	fibertools v0.3	BAM	2024-02-01	Single-molecule chromatin	{"name": "HG002 Fiber-seq", "trackType": "Chromatin accessibility", "genome": "hg38", "url": "https://example.com/HG002/fiberseq.bam"}
```

### CHM13 Reference
```tsv
HG004	assembly	3.1	PacBio HiFi	hifiasm v0.19	FASTA	2024-01-15	T2T-CHM13 aligned	{"name": "HG004 Assembly CHM13", "trackType": "Assembly", "genome": "chm13", "url": "https://example.com/HG004/assembly.chm13.fa.gz"}
```

## 🎯 Best Practices

1. **Consistent IDs**: Use the same `sample_id` across both files
2. **Complete metadata**: Fill in all columns when possible
3. **URLs**: Use full HTTPS URLs for downloads
4. **Dates**: Use YYYY-MM-DD format
5. **Tools**: Include version numbers (e.g., `hifiasm v0.19`)
6. **Platforms**: Be specific (e.g., `Illumina NovaSeq 6000` vs just `Illumina`)
7. **Notes**: Add context that helps users understand the data

## 🚀 Automation

You can generate these TSV files from your data pipeline:

```python
#!/usr/bin/env python3
import csv

# Example: Generate tracks.tsv from processed data
samples = ['HG002', 'HG00621']  # Your sample list
output_dir = '/path/to/output'

with open('tracks.tsv', 'w', newline='') as f:
    writer = csv.writer(f, delimiter='\t')
    
    # Write header
    writer.writerow(['sample_id', 'data_type', 'size_gb', 'platform', 
                     'processing_tool', 'track_type', 'file_format', 
                     'release_date', 'download_url', 'notes'])
    
    # Generate rows
    for sample in samples:
        # Assembly
        writer.writerow([
            sample,
            'assembly',
            get_file_size(f'{output_dir}/{sample}/assembly.fa.gz'),
            'PacBio HiFi',
            'hifiasm v0.19',
            'primary',
            'FASTA',
            get_date(),
            f'https://data.hprc.org/{sample}/assembly.fa.gz',
            'Phased assembly'
        ])
        
        # Add other tracks...
```

## 📖 Reference

- **Population codes**: afr (African), amr (American), eas (East Asian), eur (European), sas (South Asian)
- **Quality tiers**: high, medium, low (based on assembly completeness and N50)
- **Common platforms**: PacBio HiFi, PacBio Revio, Illumina NovaSeq, ONT PromethION
- **Standard formats**: FASTA, BAM, bedMethyl, bigWig, TSV, VCF

## 🔧 Troubleshooting

**Problem**: Conversion script fails
- Check for missing tabs (use actual tab character, not spaces)
- Ensure all required columns are present
- Check for special characters in data

**Problem**: Sample appears but no data
- Verify `sample_id` matches between files
- Check that tracks have the correct `data_type` values
- Ensure size_gb is a valid number

**Problem**: Portal doesn't show updates
- Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)
- Check browser console for errors
- Verify genomes.json was regenerated

