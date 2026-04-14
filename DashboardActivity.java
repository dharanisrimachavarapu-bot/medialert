package com.example.medicinealert;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

public class DashboardActivity extends AppCompatActivity {
    private TextView tvTotal, tvSafeCount, tvNearExpiryCount, tvExpiredCount;
    private Button btnAddMedicine, btnViewList;
    private DatabaseHelper db;
    private int userId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_dashboard);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        SharedPreferences prefs = getSharedPreferences("MedPrefs", MODE_PRIVATE);
        userId = prefs.getInt("USER_ID", -1);
        if (userId == -1) {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return;
        }

        db = new DatabaseHelper(this);
        tvTotal = findViewById(R.id.tvTotal);
        tvSafeCount = findViewById(R.id.tvSafeCount);
        tvNearExpiryCount = findViewById(R.id.tvNearExpiryCount);
        tvExpiredCount = findViewById(R.id.tvExpiredCount);
        btnAddMedicine = findViewById(R.id.btnAddMedicine);
        btnViewList = findViewById(R.id.btnViewList);

        btnAddMedicine.setOnClickListener(v -> startActivity(new Intent(this, AddMedicineActivity.class)));
        btnViewList.setOnClickListener(v -> startActivity(new Intent(this, MedicineListActivity.class)));
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadDashboardData();
    }

    private void loadDashboardData() {
        List<Medicine> list = db.getMedicines(userId);
        int total = list.size();
        int safe = 0, near = 0, expired = 0;

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        Calendar todayCal = Calendar.getInstance();
        todayCal.set(Calendar.HOUR_OF_DAY, 0);
        todayCal.set(Calendar.MINUTE, 0);
        todayCal.set(Calendar.SECOND, 0);
        todayCal.set(Calendar.MILLISECOND, 0);

        for (Medicine m : list) {
            try {
                Date expiryDate = sdf.parse(m.getExpiryDate());
                if (expiryDate != null) {
                    long diffInMillies = expiryDate.getTime() - todayCal.getTimeInMillis();
                    long days = TimeUnit.DAYS.convert(diffInMillies, TimeUnit.MILLISECONDS);

                    if (days < 0) {
                        expired++;
                    } else if (days <= 7) {
                        near++;
                    } else {
                        safe++;
                    }
                }
            } catch (ParseException e) {
                e.printStackTrace();
            }
        }

        tvTotal.setText(String.valueOf(total));
        tvSafeCount.setText(String.valueOf(safe));
        tvNearExpiryCount.setText(String.valueOf(near));
        tvExpiredCount.setText(String.valueOf(expired));
    }
}
