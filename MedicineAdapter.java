package com.example.medicinealert;

import android.app.AlertDialog;
import android.content.Context;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

public class MedicineAdapter extends RecyclerView.Adapter<MedicineAdapter.MedicineViewHolder> {
    private Context context;
    private List<Medicine> medicineList;
    private DatabaseHelper db;
    private MedicineListActivity activity;

    public MedicineAdapter(Context context, List<Medicine> medicineList, MedicineListActivity activity) {
        this.context = context;
        this.medicineList = medicineList;
        this.db = new DatabaseHelper(context);
        this.activity = activity;
    }

    @NonNull
    @Override
    public MedicineViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_medicine, parent, false);
        return new MedicineViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull MedicineViewHolder holder, int position) {
        Medicine medicine = medicineList.get(position);
        holder.tvMedicineName.setText(medicine.getName());
        holder.tvExpiryDate.setText("Expiry: " + medicine.getExpiryDate());

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        Calendar todayCal = Calendar.getInstance();
        todayCal.set(Calendar.HOUR_OF_DAY, 0);
        todayCal.set(Calendar.MINUTE, 0);
        todayCal.set(Calendar.SECOND, 0);
        todayCal.set(Calendar.MILLISECOND, 0);
        
        try {
            Date expiryDate = sdf.parse(medicine.getExpiryDate());
            if (expiryDate != null) {
                long diffInMillies = expiryDate.getTime() - todayCal.getTimeInMillis();
                long days = TimeUnit.DAYS.convert(diffInMillies, TimeUnit.MILLISECONDS);

                if (days < 0) {
                    holder.tvStatus.setText("Expired");
                    holder.tvStatus.setBackgroundColor(Color.parseColor("#F44336"));
                } else if (days <= 7) {
                    holder.tvStatus.setText("Near Expiry");
                    holder.tvStatus.setBackgroundColor(Color.parseColor("#FF9800"));
                } else {
                    holder.tvStatus.setText("Safe");
                    holder.tvStatus.setBackgroundColor(Color.parseColor("#4CAF50"));
                }
            }
        } catch (ParseException e) {
            e.printStackTrace();
        }

        holder.btnDelete.setOnClickListener(v -> {
            new AlertDialog.Builder(context)
                    .setTitle("Delete Medicine")
                    .setMessage("Are you sure you want to delete this medicine?")
                    .setPositiveButton("Yes", (dialog, which) -> {
                        boolean bgDeleted = db.deleteMedicine(medicine.getId());
                        if (bgDeleted) {
                            Toast.makeText(context, "Medicine Deleted", Toast.LENGTH_SHORT).show();
                            activity.loadMedicines();
                        }
                    })
                    .setNegativeButton("No", null)
                    .show();
        });
    }

    @Override
    public int getItemCount() {
        return medicineList.size();
    }

    public static class MedicineViewHolder extends RecyclerView.ViewHolder {
        TextView tvMedicineName, tvExpiryDate, tvStatus;
        ImageButton btnDelete;

        public MedicineViewHolder(@NonNull View itemView) {
            super(itemView);
            tvMedicineName = itemView.findViewById(R.id.tvMedicineName);
            tvExpiryDate = itemView.findViewById(R.id.tvExpiryDate);
            tvStatus = itemView.findViewById(R.id.tvStatus);
            btnDelete = itemView.findViewById(R.id.btnDelete);
        }
    }
}
