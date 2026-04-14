package com.example.medicinealert;

import android.app.DatePickerDialog;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import java.util.Calendar;
import java.util.Locale;

public class AddMedicineActivity extends AppCompatActivity {
    private EditText etMedicineName;
    private TextView tvExpiryDate;
    private Button btnSaveMedicine;
    private DatabaseHelper db;
    private int userId;
    private String selectedDate = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_medicine);

        db = new DatabaseHelper(this);
        SharedPreferences prefs = getSharedPreferences("MedPrefs", MODE_PRIVATE);
        userId = prefs.getInt("USER_ID", -1);

        etMedicineName = findViewById(R.id.etMedicineName);
        tvExpiryDate = findViewById(R.id.tvExpiryDate);
        btnSaveMedicine = findViewById(R.id.btnSaveMedicine);

        tvExpiryDate.setOnClickListener(v -> {
            Calendar calendar = Calendar.getInstance();
            int year = calendar.get(Calendar.YEAR);
            int month = calendar.get(Calendar.MONTH);
            int day = calendar.get(Calendar.DAY_OF_MONTH);

            DatePickerDialog datePickerDialog = new DatePickerDialog(this,
                    (view, year1, month1, dayOfMonth) -> {
                        selectedDate = String.format(Locale.getDefault(), "%04d-%02d-%02d", year1, month1 + 1, dayOfMonth);
                        tvExpiryDate.setText(selectedDate);
                    }, year, month, day);
            datePickerDialog.show();
        });

        btnSaveMedicine.setOnClickListener(v -> {
            String name = etMedicineName.getText().toString();
            if (name.isEmpty() || selectedDate.isEmpty()) {
                Toast.makeText(this, "Please fill all details", Toast.LENGTH_SHORT).show();
            } else {
                boolean success = db.addMedicine(userId, name, selectedDate);
                if (success) {
                    Toast.makeText(this, "Medicine Added Successfully", Toast.LENGTH_SHORT).show();
                    finish();
                } else {
                    Toast.makeText(this, "Failed to add medicine", Toast.LENGTH_SHORT).show();
                }
            }
        });
    }
}
