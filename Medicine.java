package com.example.medicinealert;

public class Medicine {
    private int id;
    private int userId;
    private String name;
    private String expiryDate; // Format: yyyy-MM-dd

    public Medicine(int id, int userId, String name, String expiryDate) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.expiryDate = expiryDate;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }
}
