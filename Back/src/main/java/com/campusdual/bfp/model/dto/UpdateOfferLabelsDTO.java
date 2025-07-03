package com.campusdual.bfp.model.dto;

import java.util.List;

public class UpdateOfferLabelsDTO {
    private List<Long> labelIds;

    public UpdateOfferLabelsDTO() {
    }

    public UpdateOfferLabelsDTO(List<Long> labelIds) {
        this.labelIds = labelIds;
    }

    public List<Long> getLabelIds() {
        return labelIds;
    }

    public void setLabelIds(List<Long> labelIds) {
        this.labelIds = labelIds;
    }
}
