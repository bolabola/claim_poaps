
const claim_url = 'https://api.poap.xyz/actions/claim-qr'

let synchronous_request = function (url, params) {
    if (params == undefined) {
        return new Promise(function (resolve, reject) {
            axios.get(url).then(res => {
                resolve(res.data);
            }).catch(err => {
                reject(err)
            });
        })
    } else {
        return new Promise(function (resolve, reject) {
            axios.post(url, params).then(res => {
                resolve(res.data);
            }).catch(err => {
                reject(err);
            });
        })
    }
}

function logit(dom, msg) {
    if ((msg == undefined) || (msg == null) || (msg == '')) {
        return;
    }
    var d = new Date();
    var n = d.toLocaleTimeString();
    var s = dom.val();
    dom.val((s + "\n" + n + ": " + msg).trim());
}

$(document).ready(function () {
    let addresses = window.localStorage.getItem('addresses');
    if(addresses){
        $("#addresses").val(addresses);
    }
    $('#claim').submit(async function (e) {
        e.preventDefault();
        addresses = $("#addresses").val().trim();
        let links = $("#links").val().trim();
        let totalClaimed = 0;
        if (addresses == '') {
            alert('Please enter addresses.');
            $("#addresses").focus();
            return;
        }
        if (links == '') {
            alert('Please enter claim links.');
            $("#links").focus();
            return;
        }
        window.localStorage.setItem('addresses',addresses);
        addresses = addresses.split("\n");
        links = links.split("\n");
        document.getElementById("log").value = "";
        logit($('#log'), `Starting...`);
        for (let link of links) {
            if (link) {
                let isClaimed = false;
                let a = link.split('/');
                let qr_hash = a[a.length - 1];
                let url = claim_url + '?qr_hash=' + qr_hash;
                let o = await synchronous_request(url)
                if (o.claimed == false) {
                    for (let address of addresses) {
                        if (!isClaimed && address) {
                            await synchronous_request(claim_url, {
                                qr_hash: o.qr_hash,
                                address: address,
                                secret: o.secret,
                            }).then(
                                res => {
                                    logit($('#log'), `${address} claimed POAP[${o.qr_hash}]`);
                                    isClaimed = true;
                                    totalClaimed++;
                                }
                            ).catch(err => {
                                console.log(`[${address}] ${err.response.data.message} POAP[${o.qr_hash}]`);
                            })
                        }
                    }

                } else {
                    logit($('#log'), `[${o.beneficiary}] had claimed this POAP[${qr_hash}]`);
                }
            }
        }
        logit($('#log'), `Claiming completed. Claimed ${totalClaimed} POAPs`);


    });

});