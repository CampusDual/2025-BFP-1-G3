package com.campusdual.bfp.controller;

import com.campusdual.bfp.api.IOfferService;
import com.campusdual.bfp.model.dto.OfferDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController()
@RequestMapping("/offers")
public class OffersController {
    @Autowired
    private IOfferService offersService;

    @PostMapping(value = "/get")
    public OfferDTO queryOffer(@RequestBody OfferDTO offerDto) {
        return offersService.queryOffer(offerDto);
    }

    @GetMapping(value = "/getAll")
    public List<OfferDTO> queryAllOffers() {
        return offersService.queryAllOffers();
    }

    @GetMapping("/getOffersByCompany/{companyId}")
    public List<OfferDTO> getOffersByCompanyId(@PathVariable int companyId) {
        return offersService.getOffersByCompanyId(companyId);
    }

    @PostMapping(value = "/add")
    public long addOffer(@RequestBody OfferDTO offerDto) {
        return offersService.insertOffer(offerDto);
    }

    @PutMapping(value = "/update")
    public long updateOffer(@RequestBody OfferDTO offerDto) {
        return offersService.updateOffer(offerDto);
    }

    @DeleteMapping(value = "/delete")
    public long deleteOffer(@RequestBody OfferDTO offerDto) {
        return offersService.deleteOffer(offerDto);
    }
}
