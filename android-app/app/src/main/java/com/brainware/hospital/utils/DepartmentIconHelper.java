package com.brainware.hospital.utils;

import com.brainware.hospital.R;
import java.util.HashMap;
import java.util.Map;

public class DepartmentIconHelper {

    private static final Map<String, Integer> ICON_MAP = new HashMap<>();

    static {
        // Exact mappings for all 44 hospital departments
        ICON_MAP.put("anesthesiology & pain management", R.drawable.dept_anesthesiology_and_pain_management);
        ICON_MAP.put("anesthesiology and pain management", R.drawable.dept_anesthesiology_and_pain_management);
        ICON_MAP.put("anesthesiology", R.drawable.dept_anesthesiology_and_pain_management);

        ICON_MAP.put("cardiology", R.drawable.dept_cardiology);
        ICON_MAP.put("cardiothoracic surgery", R.drawable.dept_cardiothoracic_surgery);
        ICON_MAP.put("cardio thoracic surgery", R.drawable.dept_cardiothoracic_surgery);

        ICON_MAP.put("child guidance clinic", R.drawable.dept_child_guidance_clinic);

        ICON_MAP.put("clinical nutrition & dietetics", R.drawable.dept_clinical_nutrition_and_dietetics);
        ICON_MAP.put("clinical nutrition and dietetics", R.drawable.dept_clinical_nutrition_and_dietetics);
        ICON_MAP.put("clinical nutrition", R.drawable.dept_clinical_nutrition_and_dietetics);

        ICON_MAP.put("critical care & icu", R.drawable.dept_critical_care_and_icu);
        ICON_MAP.put("critical care and icu", R.drawable.dept_critical_care_and_icu);
        ICON_MAP.put("critical care", R.drawable.dept_critical_care_and_icu);
        ICON_MAP.put("icu", R.drawable.dept_critical_care_and_icu);

        ICON_MAP.put("dentistry & maxillofacial surgery", R.drawable.dept_dentistry_and_maxillofacial_surgery);
        ICON_MAP.put("dentistry and maxillofacial surgery", R.drawable.dept_dentistry_and_maxillofacial_surgery);
        ICON_MAP.put("dentistry", R.drawable.dept_dentistry_and_maxillofacial_surgery);
        ICON_MAP.put("dental", R.drawable.dept_dentistry_and_maxillofacial_surgery);

        ICON_MAP.put("dermatology", R.drawable.dept_dermatology);

        ICON_MAP.put("ent (otolaryngology)", R.drawable.dept_ent_otolaryngology);
        ICON_MAP.put("ent", R.drawable.dept_ent_otolaryngology);
        ICON_MAP.put("otolaryngology", R.drawable.dept_ent_otolaryngology);

        ICON_MAP.put("emergency medicine & trauma", R.drawable.dept_emergency_medicine_and_trauma);
        ICON_MAP.put("emergency medicine and trauma", R.drawable.dept_emergency_medicine_and_trauma);
        ICON_MAP.put("emergency medicine", R.drawable.dept_emergency_medicine_and_trauma);
        ICON_MAP.put("emergency & trauma care", R.drawable.dept_emergency_medicine_and_trauma);
        ICON_MAP.put("emergency", R.drawable.dept_emergency_medicine_and_trauma);

        ICON_MAP.put("endocrinology", R.drawable.dept_endocrinology);
        ICON_MAP.put("diabetology & endocrinology", R.drawable.dept_endocrinology);
        ICON_MAP.put("diabetology and endocrinology", R.drawable.dept_endocrinology);

        ICON_MAP.put("gastroenterology", R.drawable.dept_gastroenterology);
        ICON_MAP.put("gastro surgery", R.drawable.dept_general_surgery);

        ICON_MAP.put("general medicine", R.drawable.dept_general_medicine);
        ICON_MAP.put("general surgery", R.drawable.dept_general_surgery);

        ICON_MAP.put("geriatric medicine", R.drawable.dept_geriatric_medicine);
        ICON_MAP.put("gynae oncology", R.drawable.dept_gynae_oncology);

        ICON_MAP.put("gynecology & obstetrics", R.drawable.dept_gynecology_and_obstetrics);
        ICON_MAP.put("gynecology and obstetrics", R.drawable.dept_gynecology_and_obstetrics);
        ICON_MAP.put("gynecology", R.drawable.dept_gynecology_and_obstetrics);
        ICON_MAP.put("gynaecology", R.drawable.dept_gynecology_and_obstetrics);
        ICON_MAP.put("obstetrics", R.drawable.dept_gynecology_and_obstetrics);

        ICON_MAP.put("hematology", R.drawable.dept_hematology);
        ICON_MAP.put("haematology", R.drawable.dept_hematology);

        ICON_MAP.put("immunology & allergy", R.drawable.dept_immunology_and_allergy);
        ICON_MAP.put("immunology and allergy", R.drawable.dept_immunology_and_allergy);

        ICON_MAP.put("infectious diseases", R.drawable.dept_infectious_diseases);

        ICON_MAP.put("nephrology", R.drawable.dept_nephrology);

        ICON_MAP.put("neurology", R.drawable.dept_neurology);
        ICON_MAP.put("neuro medicine", R.drawable.dept_neurology);
        ICON_MAP.put("neurosurgery", R.drawable.dept_neurosurgery);
        ICON_MAP.put("neuro surgery", R.drawable.dept_neurosurgery);

        ICON_MAP.put("nuclear medicine & pet scan", R.drawable.dept_nuclear_medicine_and_pet_scan);
        ICON_MAP.put("nuclear medicine and pet scan", R.drawable.dept_nuclear_medicine_and_pet_scan);
        ICON_MAP.put("nuclear medicine", R.drawable.dept_nuclear_medicine_and_pet_scan);

        ICON_MAP.put("onco surgery", R.drawable.dept_onco_surgery);
        ICON_MAP.put("oncology & cancer care", R.drawable.dept_oncology_and_cancer_care);
        ICON_MAP.put("oncology and cancer care", R.drawable.dept_oncology_and_cancer_care);
        ICON_MAP.put("oncology", R.drawable.dept_oncology_and_cancer_care);
        ICON_MAP.put("oncology team", R.drawable.dept_oncology_and_cancer_care);

        ICON_MAP.put("ophthalmology", R.drawable.dept_ophthalmology);

        ICON_MAP.put("orthopedics", R.drawable.dept_orthopedics);
        ICON_MAP.put("orthopaedics", R.drawable.dept_orthopedics);

        ICON_MAP.put("paediatric nephrology", R.drawable.dept_paediatric_nephrology);
        ICON_MAP.put("pediatric nephrology", R.drawable.dept_paediatric_nephrology);

        ICON_MAP.put("paediatric orthopaedics", R.drawable.dept_paediatric_orthopaedics);
        ICON_MAP.put("pediatric orthopedics", R.drawable.dept_paediatric_orthopaedics);

        ICON_MAP.put("pathology & laboratory medicine", R.drawable.dept_pathology_and_laboratory_medicine);
        ICON_MAP.put("pathology and laboratory medicine", R.drawable.dept_pathology_and_laboratory_medicine);
        ICON_MAP.put("pathology", R.drawable.dept_pathology_and_laboratory_medicine);

        ICON_MAP.put("pediatric surgery", R.drawable.dept_pediatric_surgery);
        ICON_MAP.put("paediatric surgery", R.drawable.dept_pediatric_surgery);

        ICON_MAP.put("pediatrics", R.drawable.dept_pediatrics);
        ICON_MAP.put("paediatrics", R.drawable.dept_pediatrics);

        ICON_MAP.put("physical medicine & rehabilitation", R.drawable.dept_physical_medicine_and_rehabilitation);
        ICON_MAP.put("physical medicine and rehabilitation", R.drawable.dept_physical_medicine_and_rehabilitation);
        ICON_MAP.put("physical medicine", R.drawable.dept_physical_medicine_and_rehabilitation);

        ICON_MAP.put("plastic & reconstructive surgery", R.drawable.dept_plastic_and_reconstructive_surgery);
        ICON_MAP.put("plastic and reconstructive surgery", R.drawable.dept_plastic_and_reconstructive_surgery);
        ICON_MAP.put("plastic surgery", R.drawable.dept_plastic_and_reconstructive_surgery);

        ICON_MAP.put("psychiatry & mental health", R.drawable.dept_psychiatry_and_mental_health);
        ICON_MAP.put("psychiatry and mental health", R.drawable.dept_psychiatry_and_mental_health);
        ICON_MAP.put("psychiatry", R.drawable.dept_psychiatry_and_mental_health);

        ICON_MAP.put("pulmonology", R.drawable.dept_pulmonology);
        ICON_MAP.put("resp medicine & allergy", R.drawable.dept_pulmonology);

        ICON_MAP.put("radiation oncology", R.drawable.dept_radiation_oncology);

        ICON_MAP.put("radiology & imaging", R.drawable.dept_radiology_and_imaging);
        ICON_MAP.put("radiology and imaging", R.drawable.dept_radiology_and_imaging);
        ICON_MAP.put("radiology", R.drawable.dept_radiology_and_imaging);

        ICON_MAP.put("reproductive medicine & ivf", R.drawable.dept_reproductive_medicine_and_ivf);
        ICON_MAP.put("reproductive medicine and ivf", R.drawable.dept_reproductive_medicine_and_ivf);
        ICON_MAP.put("reproductive medicine", R.drawable.dept_reproductive_medicine_and_ivf);

        ICON_MAP.put("rheumatology", R.drawable.dept_rheumatology);

        ICON_MAP.put("thalassaemia & haemoglobinopathies", R.drawable.dept_thalassaemia_and_haemoglobinopathies);
        ICON_MAP.put("thalassaemia and haemoglobinopathies", R.drawable.dept_thalassaemia_and_haemoglobinopathies);

        ICON_MAP.put("urology", R.drawable.dept_urology);

        ICON_MAP.put("vascular & endovascular surgery", R.drawable.dept_vascular_and_endovascular_surgery);
        ICON_MAP.put("vascular and endovascular surgery", R.drawable.dept_vascular_and_endovascular_surgery);
    }

    public static int getIconDrawableRes(String deptName) {
        if (deptName == null || deptName.trim().isEmpty()) {
            return R.drawable.dept_general_medicine;
        }
        String clean = deptName.toLowerCase().trim();
        Integer res = ICON_MAP.get(clean);
        if (res != null) {
            return res;
        }

        // Fuzzy partial matching fallback
        for (Map.Entry<String, Integer> entry : ICON_MAP.entrySet()) {
            if (clean.contains(entry.getKey()) || entry.getKey().contains(clean)) {
                return entry.getValue();
            }
        }

        return R.drawable.dept_general_medicine;
    }
}
