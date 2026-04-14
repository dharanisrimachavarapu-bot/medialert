package com.example.medicinealert;

import android.content.SharedPreferences;
import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

public class MedicineListActivity extends AppCompatActivity {
    private RecyclerView recyclerView;
    private MedicineAdapter adapter;
    private DatabaseHelper db;
    private int userId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_medicine_list);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        SharedPreferences prefs = getSharedPreferences("MedPrefs", MODE_PRIVATE);
        userId = prefs.getInt("USER_ID", -1);
        db = new DatabaseHelper(this);

        recyclerView = findViewById(R.id.recyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));

        loadMedicines();
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Automatically refresh the list of medicines whenever user comes back to this screen
        loadMedicines();
    }

    public void loadMedicines() {
        List<Medicine> medicineList = db.getMedicines(userId);
        adapter = new MedicineAdapter(this, medicineList, this);
        recyclerView.setAdapter(adapter);
    }
}
