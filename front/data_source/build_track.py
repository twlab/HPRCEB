import csv
import json






genome_align_samples = ['HG00097', 'HG00099', 'HG00126', 'HG00128', 'HG00133', 'HG00140', 'HG00146', 'HG002', 'HG00232', 'HG00235', 'HG00253', 'HG00272', 'HG00280', 'HG00290', 'HG00320', 'HG00321', 'HG00323', 'HG00329', 'HG00344', 'HG00350', 'HG00408', 'HG00423', 'HG00438', 'HG005', 'HG00544', 'HG00558', 'HG00597', 'HG00609', 'HG00621', 'HG00639', 'HG00642', 'HG00658', 'HG00673', 'HG00706', 'HG00733', 'HG00735', 'HG00738', 'HG00741', 'HG01071', 'HG01074', 'HG01081', 'HG01099', 'HG01106', 'HG01109', 'HG01123', 'HG01150', 'HG01167', 'HG01175', 'HG01192', 'HG01243', 'HG01252', 'HG01255', 'HG01258', 'HG01261', 'HG01346', 'HG01358', 'HG01361', 'HG01433', 'HG01496', 'HG01530', 'HG01784', 'HG01786', 'HG01884', 'HG01891', 'HG01928', 'HG01934', 'HG01940', 'HG01943', 'HG01952', 'HG01960', 'HG01969', 'HG01975', 'HG01978', 'HG01981', 'HG01993', 'HG02004', 'HG02015', 'HG02027', 'HG02040', 'HG02055', 'HG02056', 'HG02071', 'HG02074', 'HG02080', 'HG02083', 'HG02109', 'HG02129', 'HG02132', 'HG02135', 'HG02145', 'HG02148', 'HG02155', 'HG02165', 'HG02178', 'HG02257', 'HG02258', 'HG02273', 'HG02280', 'HG02293', 'HG02300', 'HG02391', 'HG02392', 'HG02451', 'HG02486', 'HG02514', 'HG02523', 'HG02559', 'HG02572', 'HG02583', 'HG02602', 'HG02615', 'HG02622', 'HG02630', 'HG02647', 'HG02668', 'HG02698', 'HG02717', 'HG02723', 'HG02735', 'HG02738', 'HG02809', 'HG02818', 'HG02841', 'HG02886', 'HG02922', 'HG02965', 'HG02976', 'HG02984', 'HG03017', 'HG03041', 'HG03050', 'HG03098', 'HG03130', 'HG03139', 'HG03195', 'HG03209', 'HG03225', 'HG03239', 'HG03270', 'HG03369', 'HG03453', 'HG03470', 'HG03471', 'HG03486', 'HG03516', 'HG03521', 'HG03540', 'HG03579', 'HG03583', 'HG03654', 'HG03669', 'HG03688', 'HG03704', 'HG03710', 'HG03742', 'HG03784', 'HG03804', 'HG03816', 'HG03831', 'HG03834', 'HG03874', 'HG03927', 'HG03942', 'HG04115', 'HG04157', 'HG04160', 'HG04184', 'HG04187', 'HG04199', 'HG04204', 'HG04228', 'HG06807', 'NA18505', 'NA18508', 'NA18522', 'NA18565', 'NA18570', 'NA18608', 'NA18620', 'NA18747', 'NA18879', 'NA18906', 'NA18940', 'NA18943', 'NA18944', 'NA18945', 'NA18948', 'NA18952', 'NA18959', 'NA18960', 'NA18967', 'NA18970', 'NA18971', 'NA18974', 'NA18976', 'NA18982', 'NA18983', 'NA19036', 'NA19043', 'NA19087', 'NA19159', 'NA19185', 'NA19240', 'NA19338', 'NA19391', 'NA19443', 'NA19468', 'NA19682', 'NA19700', 'NA19776', 'NA19835', 'NA19909', 'NA20129', 'NA20282', 'NA20346', 'NA20503', 'NA20752', 'NA20762', 'NA20799', 'NA20805', 'NA20806', 'NA20809', 'NA20827', 'NA20850', 'NA20870', 'NA20905', 'NA21093', 'NA21102', 'NA21106', 'NA21110', 'NA21144', 'NA21309']



rna_seq_samples = ['HG00097', 'HG00099', 'HG00126', 'HG00128', 'HG00133', 'HG00140', 'HG00146', 'HG00232', 'HG00235', 'HG00253', 'HG00272', 'HG00280', 'HG00290', 'HG00320', 'HG00321', 'HG00323', 'HG00329', 'HG00344', 'HG00350', 'HG00408', 'HG00423', 'HG00438', 'HG00544', 'HG00558', 'HG00597', 'HG00609', 'HG00621', 'HG00639', 'HG00642', 'HG00658', 'HG00673', 'HG00706', 'HG00735', 'HG00738', 'HG00741', 'HG01071', 'HG01074', 'HG01081', 'HG01099', 'HG01106', 'HG01150', 'HG01167', 'HG01175', 'HG01192', 'HG01252', 'HG01255', 'HG01258', 'HG01261', 'HG01346', 'HG01358', 'HG01361', 'HG01433', 'HG01496', 'HG01530', 'HG01784', 'HG01786', 'HG01884', 'HG01891', 'HG01928', 'HG01934', 'HG01940', 'HG01943', 'HG01952', 'HG01960', 'HG01969', 'HG01975', 'HG01978', 'HG01981', 'HG01993', 'HG02004', 'HG02015', 'HG02027', 'HG02040', 'HG02056', 'HG02071', 'HG02074', 'HG02083', 'HG02129', 'HG02132', 'HG02135', 'HG02148', 'HG02155', 'HG02165', 'HG02178', 'HG02257', 'HG02258', 'HG02273', 'HG02280', 'HG02293', 'HG02300', 'HG02391', 'HG02392', 'HG02451', 'HG02514', 'HG02523', 'HG02572', 'HG02583', 'HG02602', 'HG02615', 'HG02622', 'HG02630', 'HG02647', 'HG02668', 'HG02698', 'HG02717', 'HG02735', 'HG02738', 'HG02809', 'HG02841', 'HG02886', 'HG02922', 'HG02965', 'HG02976', 'HG02984', 'HG03017', 'HG03041', 'HG03050', 'HG03130', 'HG03139', 'HG03195', 'HG03209', 'HG03225', 'HG03239', 'HG03270', 'HG03369', 'HG03453', 'HG03470', 'HG03516', 'HG03521', 'HG03540', 'HG03579', 'HG03583', 'HG03654', 'HG03669', 'HG03688', 'HG03704', 'HG03710', 'HG03742', 'HG03784', 'HG03804', 'HG03816', 'HG03831', 'HG03834', 'HG03874', 'HG03927', 'HG03942', 'HG04115', 'HG04157', 'HG04160', 'HG04184', 'HG04187', 'HG04199', 'HG04204', 'HG04228', 'NA18505', 'NA18508', 'NA18522', 'NA18565', 'NA18570', 'NA18608', 'NA18620', 'NA18747', 'NA18879', 'NA18952', 'NA18967', 'NA18970', 'NA18971', 'NA18974', 'NA18976', 'NA18983', 'NA19036', 'NA19043', 'NA19087', 'NA19159', 'NA19185', 'NA19338', 'NA19391', 'NA19443', 'NA19468', 'NA19682', 'NA19700', 'NA19776', 'NA19835', 'NA19909', 'NA20282', 'NA20346', 'NA20503', 'NA20752', 'NA20762', 'NA20799', 'NA20805', 'NA20806', 'NA20809', 'NA20827', 'NA20850', 'NA20870', 'NA20905', 'NA21093', 'NA21102', 'NA21106', 'NA21110', 'NA21144']


repeat_masker_samples = ['HG00097', 'HG00099', 'HG00126', 'HG00128', 'HG00133', 'HG00140', 'HG00146', 'HG00232', 'HG00235', 'HG00253', 'HG00272', 'HG00280', 'HG00290', 'HG00320', 'HG00321', 'HG00323', 'HG00329', 'HG00344', 'HG00350', 'HG00408', 'HG00423', 'HG00438', 'HG005', 'HG00544', 'HG00558', 'HG00597', 'HG00609', 'HG00621', 'HG00639', 'HG00642', 'HG00658', 'HG00673', 'HG00706', 'HG00733', 'HG00735', 'HG00738', 'HG00741', 'HG01071', 'HG01074', 'HG01081', 'HG01099', 'HG01106', 'HG01109', 'HG01123', 'HG01150', 'HG01167', 'HG01175', 'HG01192', 'HG01243', 'HG01252', 'HG01255', 'HG01258', 'HG01261', 'HG01346', 'HG01358', 'HG01361', 'HG01433', 'HG01496', 'HG01530', 'HG01784', 'HG01786', 'HG01884', 'HG01891', 'HG01928', 'HG01934', 'HG01940', 'HG01943', 'HG01952', 'HG01960', 'HG01969', 'HG01975', 'HG01978', 'HG01981', 'HG01993', 'HG02004', 'HG02015', 'HG02027', 'HG02040', 'HG02055', 'HG02056', 'HG02071', 'HG02074', 'HG02080', 'HG02083', 'HG02109', 'HG02129', 'HG02132', 'HG02135', 'HG02145', 'HG02148', 'HG02155', 'HG02165', 'HG02178', 'HG02257', 'HG02258', 'HG02273', 'HG02280', 'HG02293', 'HG02300', 'HG02391', 'HG02392', 'HG02451', 'HG02486', 'HG02514', 'HG02523', 'HG02559', 'HG02572', 'HG02583', 'HG02602', 'HG02615', 'HG02622', 'HG02630', 'HG02647', 'HG02668', 'HG02698', 'HG02717', 'HG02723', 'HG02735', 'HG02738', 'HG02809', 'HG02818', 'HG02841', 'HG02886', 'HG02922', 'HG02965', 'HG02976', 'HG02984', 'HG03017', 'HG03041', 'HG03050', 'HG03098', 'HG03130', 'HG03139', 'HG03195', 'HG03209', 'HG03225', 'HG03239', 'HG03270', 'HG03369', 'HG03453', 'HG03470', 'HG03471', 'HG03486', 'HG03516', 'HG03521', 'HG03540', 'HG03579', 'HG03583', 'HG03654', 'HG03669', 'HG03688', 'HG03704', 'HG03710', 'HG03742', 'HG03784', 'HG03804', 'HG03816', 'HG03831', 'HG03834', 'HG03874', 'HG03927', 'HG03942', 'HG04115', 'HG04157', 'HG04160', 'HG04184', 'HG04187', 'HG04199', 'HG04204', 'HG04228', 'HG06807', 'NA18505', 'NA18508', 'NA18522', 'NA18565', 'NA18570', 'NA18608', 'NA18620', 'NA18747', 'NA18879', 'NA18906', 'NA18940', 'NA18943', 'NA18944', 'NA18945', 'NA18948', 'NA18952', 'NA18959', 'NA18960', 'NA18967', 'NA18970', 'NA18971', 'NA18974', 'NA18976', 'NA18982', 'NA18983', 'NA19036', 'NA19043', 'NA19087', 'NA19159', 'NA19185', 'NA19240', 'NA19338', 'NA19391', 'NA19443', 'NA19468', 'NA19682', 'NA19700', 'NA19776', 'NA19835', 'NA19909', 'NA20129', 'NA20282', 'NA20346', 'NA20503', 'NA20752', 'NA20762', 'NA20799', 'NA20805', 'NA20806', 'NA20809', 'NA20827', 'NA20850', 'NA20870', 'NA20905', 'NA21093', 'NA21102', 'NA21106', 'NA21110', 'NA21144', 'NA21309']


pacbio_methylation_samples = ['HG002', 'HG00097', 'HG00099', 'HG00126', 'HG00128', 'HG00133', 'HG00140', 'HG00146', 'HG00232', 'HG00235', 'HG00253', 'HG00272', 'HG00280', 'HG00290', 'HG00320', 'HG00321', 'HG00323', 'HG00329', 'HG00344', 'HG00350', 'HG00408', 'HG00423', 'HG00438', 'HG005', 'HG00544', 'HG00558', 'HG00597', 'HG00609', 'HG00621', 'HG00639', 'HG00642', 'HG00658', 'HG00673', 'HG00706', 'HG00733', 'HG00735', 'HG00738', 'HG00741', 'HG01071', 'HG01074', 'HG01081', 'HG01099', 'HG01106', 'HG01109', 'HG01123', 'HG01150', 'HG01167', 'HG01175', 'HG01192', 'HG01243', 'HG01252', 'HG01255', 'HG01258', 'HG01261', 'HG01346', 'HG01358', 'HG01361', 'HG01433', 'HG01496', 'HG01530', 'HG01784', 'HG01786', 'HG01884', 'HG01891', 'HG01928', 'HG01934', 'HG01940', 'HG01943', 'HG01952', 'HG01960', 'HG01969', 'HG01975', 'HG01978', 'HG01981', 'HG01993', 'HG02004', 'HG02027', 'HG02040', 'HG02055', 'HG02056', 'HG02071', 'HG02074', 'HG02083', 'HG02129', 'HG02132', 'HG02135', 'HG02145', 'HG02148', 'HG02155', 'HG02165', 'HG02178', 'HG02257', 'HG02258', 'HG02273', 'HG02280', 'HG02293', 'HG02300', 'HG02391', 'HG02392', 'HG02451', 'HG02486', 'HG02514', 'HG02523', 'HG02559', 'HG02572', 'HG02602', 'HG02615', 'HG02622', 'HG02630', 'HG02647', 'HG02668', 'HG02698', 'HG02717', 'HG02723', 'HG02735', 'HG02738', 'HG02809', 'HG02818', 'HG02841', 'HG02886', 'HG02922', 'HG02965', 'HG02976', 'HG02984', 'HG03017', 'HG03041', 'HG03050', 'HG03098', 'HG03130', 'HG03139', 'HG03195', 'HG03209', 'HG03225', 'HG03239', 'HG03270', 'HG03369', 'HG03453', 'HG03470', 'HG03471', 'HG03486', 'HG03516', 'HG03521', 'HG03540', 'HG03579', 'HG03583', 'HG03654', 'HG03669', 'HG03688', 'HG03704', 'HG03710', 'HG03742', 'HG03784', 'HG03804', 'HG03816', 'HG03831', 'HG03834', 'HG03874', 'HG03927', 'HG03942', 'HG04115', 'HG04157', 'HG04160', 'HG04184', 'HG04199', 'HG04204', 'HG04228', 'NA18505', 'NA18508', 'NA18522', 'NA18565', 'NA18570', 'NA18608', 'NA18620', 'NA18747', 'NA18879', 'NA18906', 'NA18940', 'NA18943', 'NA18944', 'NA18945', 'NA18948', 'NA18952', 'NA18960', 'NA18967', 'NA18971', 'NA18974', 'NA18976', 'NA18983', 'NA19036', 'NA19043', 'NA19087', 'NA19159', 'NA19185', 'NA19240', 'NA19391', 'NA19443', 'NA19468', 'NA19682', 'NA19700', 'NA19776', 'NA19835', 'NA19909', 'NA20129', 'NA20282', 'NA20346', 'NA20503', 'NA20752', 'NA20799', 'NA20805', 'NA20806', 'NA20809', 'NA20827', 'NA20850', 'NA20870', 'NA20905', 'NA21093', 'NA21102', 'NA21106', 'NA21110', 'NA21144', 'NA21309']

ont_methylation_samples = ['HG00097', 'HG00099', 'HG00126', 'HG00128', 'HG00133', 'HG00140', 'HG00146', 'HG00232', 'HG00235', 'HG00253', 'HG00272', 'HG00280', 'HG00290', 'HG00320', 'HG00321', 'HG00323', 'HG00329', 'HG00344', 'HG00350', 'HG00408', 'HG00423', 'HG00438', 'HG005', 'HG00544', 'HG00558', 'HG00597', 'HG00609', 'HG00621', 'HG00639', 'HG00642', 'HG00658', 'HG00673', 'HG00706', 'HG00733', 'HG00735', 'HG00738', 'HG00741', 'HG01071', 'HG01074', 'HG01081', 'HG01099', 'HG01106', 'HG01109', 'HG01123', 'HG01150', 'HG01167', 'HG01175', 'HG01192', 'HG01243', 'HG01252', 'HG01255', 'HG01258', 'HG01261', 'HG01346', 'HG01358', 'HG01361', 'HG01433', 'HG01496', 'HG01530', 'HG01784', 'HG01786', 'HG01884', 'HG01891', 'HG01928', 'HG01934', 'HG01940', 'HG01943', 'HG01952', 'HG01960', 'HG01969', 'HG01975', 'HG01978', 'HG01981', 'HG01993', 'HG02004', 'HG02015', 'HG02027', 'HG02040', 'HG02055', 'HG02056', 'HG02071', 'HG02074', 'HG02080', 'HG02083', 'HG02109', 'HG02129', 'HG02132', 'HG02135', 'HG02145', 'HG02148', 'HG02155', 'HG02165', 'HG02178', 'HG02257', 'HG02258', 'HG02273', 'HG02280', 'HG02293', 'HG02300', 'HG02391', 'HG02392', 'HG02451', 'HG02486', 'HG02514', 'HG02523', 'HG02559', 'HG02572', 'HG02583', 'HG02602', 'HG02615', 'HG02630', 'HG02647', 'HG02668', 'HG02698', 'HG02717', 'HG02723', 'HG02735', 'HG02738', 'HG02809', 'HG02818', 'HG02841', 'HG02886', 'HG02922', 'HG02965', 'HG02976', 'HG02984', 'HG03017', 'HG03041', 'HG03050', 'HG03098', 'HG03130', 'HG03139', 'HG03195', 'HG03209', 'HG03225', 'HG03239', 'HG03270', 'HG03369', 'HG03453', 'HG03470', 'HG03471', 'HG03486', 'HG03516', 'HG03521', 'HG03540', 'HG03579', 'HG03583', 'HG03654', 'HG03669', 'HG03688', 'HG03704', 'HG03710', 'HG03742', 'HG03784', 'HG03804', 'HG03816', 'HG03831', 'HG03834', 'HG03874', 'HG03927', 'HG03942', 'HG04115', 'HG04157', 'HG04160', 'HG04184', 'HG04187', 'HG04199', 'HG04204', 'HG04228', 'HG06807', 'NA18505', 'NA18508', 'NA18522', 'NA18565', 'NA18570', 'NA18608', 'NA18620', 'NA18747', 'NA18879', 'NA18906', 'NA18940', 'NA18943', 'NA18944', 'NA18945', 'NA18948', 'NA18952', 'NA18959', 'NA18960', 'NA18967', 'NA18970', 'NA18971', 'NA18974', 'NA18976', 'NA18982', 'NA18983', 'NA19036', 'NA19043', 'NA19159', 'NA19185', 'NA19240', 'NA19338', 'NA19391', 'NA19443', 'NA19468', 'NA19682', 'NA19700', 'NA19776', 'NA19835', 'NA19909', 'NA20129', 'NA20282', 'NA20346', 'NA20503', 'NA20752', 'NA20762', 'NA20799', 'NA20805', 'NA20806', 'NA20809', 'NA20827', 'NA20850', 'NA20870', 'NA20905', 'NA21093', 'NA21102', 'NA21106', 'NA21110', 'NA21144', 'NA21309']


pacbio_fiberseq_samples = ['HG002', 'HG01123', 'HG01258', 'HG01358', 'HG01361', 'HG01891', 'HG02071', 'HG02074', 'HG02132', 'HG02135', 'HG02257', 'HG02486', 'HG02559', 'HG02572', 'HG02717', 'HG02886', 'HG03516', 'HG03804', 'HG03942', 'HG04160', 'HG04187']

ont_fiberseq_samples = ['HG002', 'HG00438', 'HG00621', 'HG00673', 'HG00735', 'HG00741', 'HG01071', 'HG01106', 'HG01175', 'HG01358', 'HG01891', 'HG01928', 'HG01952', 'HG01978', 'HG02148', 'HG02257', 'HG02486', 'HG02559', 'HG02622', 'HG02630', 'HG03453', 'HG03540', 'HG03579', 'HG04157']


omnic_samples = ['HG00097', 'HG00099', 'HG00126', 'HG00128', 'HG00133', 'HG00140', 'HG00146', 'HG002', 'HG00232', 'HG00235', 'HG00253', 'HG00272', 'HG00280', 'HG00290', 'HG00320', 'HG00321', 'HG00323', 'HG00329', 'HG00344', 'HG00350', 'HG00408', 'HG00423', 'HG00438', 'HG00544', 'HG00558', 'HG00597', 'HG00609', 'HG00621', 'HG00639', 'HG00642', 'HG00658', 'HG00673', 'HG00706', 'HG00733', 'HG00735', 'HG00738', 'HG00741', 'HG01071', 'HG01074', 'HG01081', 'HG01099', 'HG01106', 'HG01109', 'HG01123', 'HG01150', 'HG01167', 'HG01175', 'HG01192', 'HG01243', 'HG01252', 'HG01255', 'HG01258', 'HG01261', 'HG01346', 'HG01358', 'HG01361', 'HG01433', 'HG01496', 'HG01530', 'HG01784', 'HG01786', 'HG01884', 'HG01891', 'HG01928', 'HG01934', 'HG01940', 'HG01943', 'HG01952', 'HG01960', 'HG01969', 'HG01975', 'HG01978', 'HG01981', 'HG01993', 'HG02004', 'HG02015', 'HG02027', 'HG02040', 'HG02055', 'HG02056', 'HG02071', 'HG02074', 'HG02080', 'HG02083', 'HG02109', 'HG02129', 'HG02132', 'HG02135', 'HG02145', 'HG02148', 'HG02155', 'HG02165', 'HG02178', 'HG02257', 'HG02258', 'HG02273', 'HG02280', 'HG02293', 'HG02300', 'HG02391', 'HG02392', 'HG02451', 'HG02486', 'HG02514', 'HG02523', 'HG02559', 'HG02572', 'HG02583', 'HG02602', 'HG02615', 'HG02622', 'HG02630', 'HG02647', 'HG02668', 'HG02698', 'HG02717', 'HG02723', 'HG02735', 'HG02738', 'HG02809', 'HG02841', 'HG02886', 'HG02922', 'HG02965', 'HG02976', 'HG02984', 'HG03017', 'HG03041', 'HG03050', 'HG03098', 'HG03130', 'HG03139', 'HG03195', 'HG03209', 'HG03225', 'HG03239', 'HG03270', 'HG03369', 'HG03453', 'HG03470', 'HG03471', 'HG03516', 'HG03521', 'HG03540', 'HG03579', 'HG03583', 'HG03654', 'HG03669', 'HG03688', 'HG03704', 'HG03710', 'HG03742', 'HG03784', 'HG03804', 'HG03816', 'HG03831', 'HG03834', 'HG03874', 'HG03927', 'HG03942', 'HG04115', 'HG04157', 'HG04160', 'HG04184', 'HG04187', 'HG04199', 'HG04204', 'HG04228', 'NA18505', 'NA18508', 'NA18522', 'NA18565', 'NA18570', 'NA18608', 'NA18620', 'NA18747', 'NA18879', 'NA18952', 'NA18971', 'NA18974', 'NA18976', 'NA18983', 'NA19036', 'NA19043', 'NA19087', 'NA19159', 'NA19185', 'NA19338', 'NA19391', 'NA19443', 'NA19468', 'NA19682', 'NA19700', 'NA19776', 'NA19835', 'NA19909', 'NA20282', 'NA20346', 'NA20503', 'NA20752', 'NA20762', 'NA20799', 'NA20805', 'NA20806', 'NA20809', 'NA20827', 'NA20850', 'NA20870', 'NA20905', 'NA21093', 'NA21102', 'NA21106', 'NA21110', 'NA21144']




tracks_example = """sample_id	data_type	size_bytes	data_attributes	browser_attributes
"""

# tracks_example = """sample_id	data_type	size_bytes	data_attributes	browser_attributes\n"""


rna_seq_color1 = "#10b981"
rna_seq_color2 = "#0d9668"  # Darker green - rgb(13, 150, 104)

fiberseq_color1 = "#f59e0b"
fiberseq_color2 = "#d97706"  # Darker amber - rgb(217, 119, 6)

methylation_color1 = "#06b6d4"
methylation_color2 = "#0891b2"  # Darker cyan - rgb(8, 145, 178)  



for s in rna_seq_samples:
    for ref in ["hg38", "chm13"]:
        for strand in ["plus", "minus"]:
            track_name = f"{s} Kinnex ({strand} strand)"
            url = f"https://hprc-epigenome.s3.us-east-2.amazonaws.com/samples/{s}/expression.{strand}.{ref}.bw"
            

            data_attrs = json.dumps({"platform": "PacBio Kinnex", "processing_tool": "minimap", "file_format": "bigWig", "description": "PacBio Kinnex"})
            browser_attrs = json.dumps({"coordinate": ref, "type": "bigwig", "url": url, "name": track_name, 
            "options":{"color":rna_seq_color1, "color2": rna_seq_color2}})
            l = [s, "expression", 12000000, data_attrs, browser_attrs]
            line = "\t".join(list(map(str, l)))

            tracks_example += line + "\n"


for s in genome_align_samples:
    for ref in ["hg38", "chm13"]:
        if s in omnic_samples:
            track_name = f"{s} Hi-C"
            url = f"https://hprc-epigenome.s3.us-east-2.amazonaws.com/samples/{s}/{ref}.hic"

            data_attrs = json.dumps({"description": f"Hi-C"})
            browser_attrs = json.dumps({"coordinate": f"{ref}", "type": "hic", "url": url, "name": track_name, "options":{"displayMode": "heatmap", "normalization": "SCALE", "binSize": "10000"}})
            l = [s, "chromatin_conformation", 3800000000, data_attrs, browser_attrs]
            line = "\t".join(list(map(str, l)))
            tracks_example += line + "\n"
    
    for h in [1, 2]:
        for ref in ["hg38", "chm13"]:
            track_name = f"{ref} vs {s} hap{h}"
            url = f"https://hprc-epigenome.s3.us-east-2.amazonaws.com/samples/{s}/hap{h}_vs_{ref}.gz"
            # url = f"https://wangcluster.wustl.edu/~wzhang/projects/HPRCEN/data/genome_align_tracks/{ref}/{s}/{h}/genome.gz"
            
            data_attrs = json.dumps({"description": f"{ref} vs {s} hap{h}"})
            browser_attrs = json.dumps({"coordinate": ref, "querygenome": f"{s}_{h}", "type": "genomealign", "url": url, "name": track_name})
            l = [s, "assembly", 1800000000, data_attrs, browser_attrs]
            line = "\t".join(list(map(str, l)))

            tracks_example += line + "\n"

        if s in genome_align_samples:
            track_name = f"hap{h} gene"
            url = f"https://hprc-epigenome.s3.amazonaws.com/samples/{s}/hap{h}.refbed.gz"

            data_attrs = json.dumps({"description": f"Gene annotation by CAT2"})
            browser_attrs = json.dumps({"coordinate": f"{s}_{h}", "type": "refbed", "url": url, "name": track_name, "metadata": {"genome": f"{s}_{h}", }})

            l = [s, "annotation", 1300000, data_attrs, browser_attrs]
            line = "\t".join(list(map(str, l)))
            tracks_example += line + "\n"

        if s in repeat_masker_samples:
            track_name = f"hap{h} RepeatMasker"
            url = f"https://hprc-epigenome.s3.us-east-2.amazonaws.com/samples/{s}/RepeatMasker.hap{h}.bb"
            
            data_attrs = json.dumps({"description": f"Repeat masker"})
            browser_attrs = json.dumps({"coordinate": f"{s}_{h}", "type": "repeatmasker", "url": url, "name": track_name, "metadata": {"genome": f"{s}_{h}",}})
            l = [s, "repeatmasker", 140000000, data_attrs, browser_attrs]
            line = "\t".join(list(map(str, l)))
            tracks_example += line + "\n"
        

        if s in genome_align_samples:
            track_name = f"hap{h} CpG islands"
            url = f"https://hprc-epigenome.s3.amazonaws.com/samples/{s}/CGI.bed.gz"
            
            data_attrs = json.dumps({"description": f"CpG island annotation"})
            browser_attrs = json.dumps({"coordinate": f"{s}_{h}", "type": "categorical", "url": url, "name": track_name, "metadata": {"genome": f"{s}_{h}",},"options": {"category": {"1": {"name": "CpG Island", "color": "#1F3A5F"},"2": {"name": "CpG Shore", "color": "#4A79A8"},"3": {"name": "CpG Shelf", "color": "#A9C7E8"},}, "height": 23, "alwaysDrawLabel": False}})
            l = [s, "annotation", 1300000, data_attrs, browser_attrs]
            line = "\t".join(list(map(str, l)))
            tracks_example += line + "\n"
        
        for platform in ["PacBio", "ONT"]:
            track_name = f"hap{h} HMM Flagger ({platform})"
            url = f"https://hprc-epigenome.s3.amazonaws.com/samples/{s}/HMMFlagger.{platform}.bed.gz"
            
            data_attrs = json.dumps({"description": f"HMM Flagger {platform}"})
            browser_attrs = json.dumps({"coordinate": f"{s}_{h}", "type": "categorical", "url": url, "name": track_name, "metadata": {"genome": f"{s}_{h}",},"options": {"category": {"Col": {"name": "Collapsed", "color": "rgb(170,0,255)"},"NNN": {"name": "NNN", "color": "rgb(0,0,0)"},"Err": {"name": "Erroneous", "color": "rgb(162,0,37)"},"Dup": {"name": "Duplicated", "color": "rgb(250,104,0)"},}}})
            l = [s, "annotation", 4000, data_attrs, browser_attrs]
            line = "\t".join(list(map(str, l)))
            tracks_example += line + "\n"

        if s in rna_seq_samples:
            for split in ["specific", "combined"]:
                for strand in ["plus", "minus"]:
                    track_name = f"{s} Kinnex ({strand} strand) haplotype {split}"
                    url = f"https://hprc-epigenome.s3.us-east-2.amazonaws.com/samples/{s}/expression.{strand}.hap{h}.{split}.bw"

                    data_attrs = json.dumps(
                        {"platform": "PacBio Kinnex", "processing_tool": "minimap", "file_format": "bigWig",
                         "description": "PacBio Kinnex"})
                    browser_attrs = json.dumps({"coordinate": f"{s}_{h}", "type": "bigwig", "url": url, "name": track_name, "metadata": {"genome": f"{s}_{h}",},
                                                "options": {"color": rna_seq_color1, "color2": rna_seq_color2}})
                    l = [s, "expression", 12000000, data_attrs, browser_attrs]
                    line = "\t".join(list(map(str, l)))

                    tracks_example += line + "\n"

        if s in ont_methylation_samples:
            track_name = f"hap{h} ONT methylation"
            # url = f"https://wangcluster.wustl.edu/~wzhang/projects/HPRCEN/data/methylation_modbed/{s}_ONT.{h}.modbed.gz"
            url = f"https://hprc-epigenome.s3.us-east-2.amazonaws.com/samples/{s}/methylation.ONT.hap{h}.modbed.gz"

            data_attrs = json.dumps({"description": f"PacBio methylation"})
            browser_attrs = json.dumps({"coordinate": f"{s}_{h}", "type": "modbed", "url": url, "name": track_name, "metadata": {"genome": f"{s}_{h}"}, "options":{"color":methylation_color1, "displayMode": "summary"}})
            l = [s, "methylation", 3200000000, data_attrs, browser_attrs]
            line = "\t".join(list(map(str, l)))
            tracks_example += line + "\n"

        
        if s in pacbio_methylation_samples:
            # MethylC
            track_name = f"hap{h} PacBio methylation"
            url = f"https://hprc-epigenome.s3.us-east-2.amazonaws.com/samples/{s}/methylation.PacBio.hap{h}.methylc.gz"

            data_attrs = json.dumps({"description": f"PacBio methylation"})
            browser_attrs = json.dumps({"coordinate": f"{s}_{h}", "type": "methylc", "url": url, "name": track_name, "metadata": {"genome": f"{s}_{h}"}, "options":{"isCombineStrands": True, "colorsForContext": {"CG": { "color": methylation_color2, "background": "white" }}}})
            l = [s, "methylation", 320000000, data_attrs, browser_attrs]
            line = "\t".join(list(map(str, l)))
            tracks_example += line + "\n"

        if s in ont_fiberseq_samples:
            track_name = f"hap{h} ONT Fiber-seq raw m6A"
            url = f"https://hprc-epigenome.s3.us-east-2.amazonaws.com/samples/{s}/fiberseq.ONT.hap{h}.modbed.gz"

            data_attrs = json.dumps({"description": f"ONT Fiber-seq raw 6mA"})
            browser_attrs = json.dumps({"coordinate": f"{s}_{h}", "type": "modbed", "url": url, "name": track_name, "metadata": {"genome": f"{s}_{h}"}, "options":{"color":fiberseq_color1, "displayMode": "summary"}})
            l = [s, "chromatin_accessibility", 720000000, data_attrs, browser_attrs]
            line = "\t".join(list(map(str, l)))
            tracks_example += line + "\n"

            for tn in ["fire.coverage", "percent.accessible", "linker.coverage", "nucleosome.coverage"]:
                track_name = f"hap{h} ONT Fiber-seq {tn}"
                url = f"https://hprc-epigenome.s3.us-east-2.amazonaws.com/samples/{s}/fiberseq.ONT.all.{tn}.bw"
                data_attrs = json.dumps({"description": f"ONT Fiber-seq {tn}"})
                browser_attrs = json.dumps({"coordinate": f"{s}_{h}", "type": "bigwig", "url": url, "name": track_name, "metadata": {"genome": f"{s}_{h}"}, "options":{"color":fiberseq_color1}})
                l = [s, "chromatin_accessibility", 720000000, data_attrs, browser_attrs]
                line = "\t".join(list(map(str, l)))
                tracks_example += line + "\n"

        if s in pacbio_fiberseq_samples:
            track_name = f"hap{h} PacBio Fiber-seq raw m6A"
            url = f"https://hprc-epigenome.s3.us-east-2.amazonaws.com/samples/{s}/fiberseq.PacBio.hap{h}.modbed.gz"

            data_attrs = json.dumps({"description": f"PacBio Fiber-seq raw 6mA"})
            browser_attrs = json.dumps({"coordinate": f"{s}_{h}", "type": "modbed", "url": url, "name": track_name, "metadata": {"genome": f"{s}_{h}"}, "options":{"color":fiberseq_color2, "displayMode": "summary"}})
            l = [s, "chromatin_accessibility", 220000000, data_attrs, browser_attrs]
            line = "\t".join(list(map(str, l)))
            tracks_example += line + "\n"

            for tn in ["fire.coverage", "percent.accessible", "linker.coverage", "nucleosome.coverage"]:
                track_name = f"hap{h} PacBio Fiber-seq {tn}"
                url = f"https://hprc-epigenome.s3.us-east-2.amazonaws.com/samples/{s}/fiberseq.PacBio.all.{tn}.bw"
                data_attrs = json.dumps({"description": f"PacBio Fiber-seq {tn}"})
                browser_attrs = json.dumps({"coordinate": f"{s}_{h}", "type": "bigwig", "url": url, "name": track_name, "metadata": {"genome": f"{s}_{h}"}, "options":{"color":fiberseq_color2}})
                l = [s, "chromatin_accessibility", 720000000, data_attrs, browser_attrs]
                line = "\t".join(list(map(str, l)))
                tracks_example += line + "\n"

        









# Fill in real file sizes from the S3 listing (file_size.tsv).
# Each line looks like: "<date> <time> <size> <object_key>", e.g.
#   2026-07-16 00:46:11    3105238 samples/HG00097/CGI.bed.gz
file_sizes = {}
with open("file_size.tsv") as f:
    for line in f:
        parts = line.split(maxsplit=3)
        if len(parts) < 4:
            continue
        try:
            file_sizes[parts[3].strip()] = int(parts[2])
        except ValueError:
            continue


def url_to_key(url):
    marker = ".amazonaws.com/"
    idx = url.find(marker)
    if idx == -1:
        return None
    return url[idx + len(marker):]


lines = tracks_example.rstrip("\n").split("\n")
new_lines = [lines[0]]  # header
matched = 0
missing = 0
for line in lines[1:]:
    if not line:
        continue
    cols = line.split("\t")
    browser_attrs = json.loads(cols[4])
    key = url_to_key(browser_attrs.get("url", ""))
    if key in file_sizes:
        cols[2] = str(file_sizes[key])
        matched += 1
    else:
        # print(key)
        missing += 1
    new_lines.append("\t".join(cols))

tracks_example = "\n".join(new_lines) + "\n"
print(f"Filled real file sizes: {matched} matched, {missing} using placeholder size")


with open("tracks.tsv", "w") as f:
    f.write(tracks_example)



