package com.brainware.hospital.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.brainware.hospital.R;
import com.brainware.hospital.model.FamilyMember;

import java.util.ArrayList;
import java.util.List;

public class FamilyMemberAdapter extends RecyclerView.Adapter<FamilyMemberAdapter.ViewHolder> {

    private final List<FamilyMember> items = new ArrayList<>();

    public void submitList(List<FamilyMember> newItems) {
        items.clear();
        if (newItems != null) items.addAll(newItems);
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_family_member, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        FamilyMember member = items.get(position);
        holder.tvName.setText(member.getFullName());

        StringBuilder relationLine = new StringBuilder();
        if (member.getRelation() != null && !member.getRelation().isEmpty()) relationLine.append(member.getRelation());
        if (member.getAge() != null) {
            if (relationLine.length() > 0) relationLine.append(" · ");
            relationLine.append("Age ").append(member.getAge());
        }
        if (member.getBloodGroup() != null && !member.getBloodGroup().isEmpty()) {
            if (relationLine.length() > 0) relationLine.append(" · ");
            relationLine.append(member.getBloodGroup());
        }
        holder.tvRelation.setText(relationLine.toString());

        String contact = (member.getEmail() != null ? member.getEmail() : "")
                + (member.getPhone() != null ? " · " + member.getPhone() : "");
        holder.tvContact.setText(contact);
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvName, tvRelation, tvContact;

        ViewHolder(View itemView) {
            super(itemView);
            tvName = itemView.findViewById(R.id.tvName);
            tvRelation = itemView.findViewById(R.id.tvRelation);
            tvContact = itemView.findViewById(R.id.tvContact);
        }
    }
}
