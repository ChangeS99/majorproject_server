exports.modifyLocationResults = (data) => {
    let newResult = [];
    // console.log(data);
    data.forEach(item => {
        const locationObj = {};
        const text = item.text;
        const place_name = item.place_name;
        const coordinates = item.geometry.coordinates;
        const place_type = item.place_type;
        const properties = item.properties;

        let details = {};
        if (item.context) {
            item.context.forEach(context => {
                if (context.id.startsWith("district")) {
                    details["district"] = context.text;
                }

                if (context.id.startsWith("place")) {
                    details["place"] = context.text;
                }

                if (context.id.startsWith("region")) {
                    details["region"] = context.text;
                    details["short_code"] = context.short_code;
                }

                if (context.id.startsWith("country")) {
                    details["country"] = context.text;
                    details["country_code"] = context.short_code
                }
            });
        }


        newResult.push({
            text,
            place_name,
            place_type,
            coordinates,
            properties,
            details
        });
    })

    return newResult;
}

exports.modifyCoordinateResult = (loc) =>  {
    const features = loc.features;
    const context = features[0].context;
    const location = {};
    const details = {};
    if(context){
        context.forEach(ctx => {
            if (ctx.id.startsWith("locality")) {
                details["locality"] = {
                    text: ctx.text,
                    wikidata: ctx.wikidata
                };
            }
            if (ctx.id.startsWith("district")) {
                details["district"] = {
                    text: ctx.text,
                    wikidata: ctx.wikidata
                };
            }

            if (ctx.id.startsWith("place")) {
                details["place"] = {
                    text: ctx.text,
                    wikidata: ctx.wikidata
                };
            }

            if (ctx.id.startsWith("region")) {
                details["region"] = {
                    text: ctx.text,
                    wikidata: ctx.wikidata,
                    short_code: ctx.short_code
                };
            }

            if (ctx.id.startsWith("country")) {
                details["country"] = {
                    text: ctx.text,
                    wikidata: ctx.wikidata,
                    short_code: ctx.short_code
                };
            }
        });
    }
    location["marker"] = loc.query;
    location["center"] = features[0].center;
    location["place_name"] = features[0].place_name;
    location["details"] = {...details};

    return location;
}

exports.fields = {
    global: "global",
    employee: "employee",
    patient: "patient",
    admin: "admin"
}