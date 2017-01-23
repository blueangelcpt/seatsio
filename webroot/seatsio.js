"use strict";
if (typeof(seatsio) == "undefined") {
    (function() {
        var h = {};
        h.onLoad = function(i) {
            i()
        };
        h.charts = [];
        h.CHART_ID = 0;
        h.getChart = function(k) {
            for (var j = 0; j < this.charts.length; ++j) {
                if (this.charts[j].chartId == k) {
                    return this.charts[j]
                }
            }
        };

        function c() {
            return typeof define == "function" && typeof define.amd == "object" && define.amd
        }
        if (c()) {
            define([], function() {
                return h
            })
        } else {
            window.seatsio = h
        }
        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function(m, n) {
                for (var l = (n || 0), k = this.length; l < k; l++) {
                    if (this[l] === m) {
                        return l
                    }
                }
                return -1
            }
        }

        function e(i) {
            this.val = i
        }
        e.prototype.orElse = function(i) {
            if (typeof(this.val) == "undefined" || this.val == null) {
                return i
            }
            return this.val
        };

        function d(i) {
            return new e(i)
        }

        function b(k) {
            k = k || window.event;
            if (k.origin != "https://app.seats.io") {
                return
            }
            var i = JSON.parse(k.data);
            var j = h.getChart(i.chartId);
            if (j.messageHandlers[i.type]) {
                j.messageHandlers[i.type](k, j, i)
            }
        }

        function f(k) {
            for (var j = 0; j < h.charts.length; ++j) {
                h.charts[j].handleKey(k)
            }
        }
        h.warn = function(i) {
            if (typeof console != "undefined") {
                console.warn(i)
            }
        };
        h.Embeddable = function() {};
        h.Embeddable.prototype.init = function(i) {
            if (!i) {
                i = {}
            }
            if (!i.divId) {
                i.divId = "chart"
            }
            if (!i.loading) {
                i.loading = '<div class="spinner-loader"></div>'
            }
            this.config = i;
            this.fitToHeight = this.container().offsetHeight;
            this.iframe = null
        };
        h.Embeddable.prototype.createIframe = function(i) {
            this.iframe = document.createElement("iframe");
            this.iframe.style.border = "none";
            this.iframe.scrolling = "no";
            this.iframe.frameBorder = 0;
            this.iframe.src = i;
            this.iframe.style.width = "100%";
            if (this.fitToHeight) {
                this.iframe.style.height = this.fitToHeight + "px"
            }
            this.container().appendChild(this.iframe)
        };
        h.Embeddable.prototype.container = function() {
            return document.getElementById(this.config.divId)
        };
        h.Embeddable.prototype.createLoadingDiv = function() {
            this.createSpinnerStylesheet();
            this.loadingDiv = document.createElement("div");
            this.loadingDiv.style.textAlign = "center";
            this.loadingDiv.style.padding = "20px 0";
            this.loadingDiv.innerHTML = this.config.loading;
            this.container().appendChild(this.loadingDiv)
        };
        h.Embeddable.prototype.createSpinnerStylesheet = function() {
            var i = document.createElement("link");
            i.href = "https://app.seats.io/public/stylesheets/spinner.css";
            i.type = "text/css";
            i.rel = "stylesheet";
            document.getElementsByTagName("head")[0].appendChild(i)
        };
        h.Embeddable.prototype.sendMsgToIframe = function(i) {
            i.chartId = this.chartId;
            this.iframe.contentWindow.postMessage(JSON.stringify(i), "*")
        };
        var a = {
            SHIFT: 16
        };
        h.Embeddable.prototype.handleKey = function(i) {
            if (i.keyCode === a.SHIFT) {
                this.sendMsgToIframe({
                    type: i.type,
                    keyCode: i.keyCode
                })
            }
        };
        h.SeatingChart = function(i) {
            h.charts.push(this);
            this.chartId = h.CHART_ID++;
            this.init(i);
            this.selectedObjectsInput = null;
            this.storage = h.SeatsioStorage.create(this.chartId);
            this.config.maxSelectedObjects = d(this.config.maxSelectedObjects).orElse(this.config.maxSelectedSeats);
            this.config.objectColor = d(this.config.objectColor).orElse(this.config.seatColor);
            this.config.objectLabel = d(this.config.objectLabel).orElse(this.config.seatLabel);
            this.config.objectIcon = d(this.config.objectIcon).orElse(this.config.seatIcon);
            this.config.sectionColor = this.config.sectionColor;
            this.config.selectedObjectsInputName = d(this.config.selectedObjectsInputName).orElse(this.config.selectedSeatsInputName);
            this.config.selectedObjects = d(this.config.selectedObjects).orElse(this.config.selectedSeats);
            this.config.onObjectSelected = d(this.config.onObjectSelected).orElse(this.config.onSeatSelected);
            this.config.onObjectDeselected = d(this.config.onObjectDeselected).orElse(this.config.onSeatDeselected);
            this.config.onObjectMouseOver = d(this.config.onObjectMouseOver).orElse(this.config.onSeatMouseOver);
            this.config.onObjectMouseOut = d(this.config.onObjectMouseOut).orElse(this.config.onSeatMouseOut);
            this.config.onSelectedObjectBooked = d(this.config.onSelectedObjectBooked).orElse(this.config.onSelectedSeatBooked);
            this.config.onBestAvailableSelected = d(this.config.onBestAvailableSelected).orElse(this.config.onBestAvailableSeatsSelected);
            this.config.onBestAvailableSelectionFailed = d(this.config.onBestAvailableSelectionFailed).orElse(this.config.onBestAvailableSeatsSelectionFailed);
            if (!this.config.regenerateReservationToken) {
                this.config.reservationToken = d(this.config.reservationToken).orElse(this.fetchStoredReservationToken())
            }
            this.selectedObjects = this.selectedSeats = [];
            this.reservationToken = null;
            this.requestIdCtr = 0;
            this.requestCallbacks = {};
            this.requestErrorCallbacks = {};
            this.isRendered = false
        };
        h.SeatingChart.prototype.createIframe = function() {
            this.iframe = document.createElement("iframe");
            this.iframe.style.border = "none";
            this.iframe.scrolling = "no";
            this.iframe.frameBorder = 0;
            this.iframe.src = "https://app.seats.io/chartRendererIframe.html?version=88&chartId=" + this.chartId;
            this.iframe.style.width = "100%";
            this.container().appendChild(this.iframe)
        };
        h.SeatingChart.prototype = new h.Embeddable();
        h.SeatingChart.prototype.createSelectedObjectsInput = function() {
            if (!this.config.selectedObjectsInputName) {
                return
            }
            this.selectedObjectsInput = document.createElement("input");
            this.selectedObjectsInput.type = "hidden";
            this.selectedObjectsInput.name = this.config.selectedObjectsInputName;
            this.container().appendChild(this.selectedObjectsInput)
        };
        h.SeatingChart.prototype.createReservationTokenInput = function() {
            if (!this.config.reservationTokenInputName) {
                return
            }
            this.reservationTokenInput = document.createElement("input");
            this.reservationTokenInput.type = "hidden";
            this.reservationTokenInput.name = this.config.reservationTokenInputName;
            this.container().appendChild(this.reservationTokenInput)
        };
        h.SeatingChart.prototype.updateSelectedObjectsInputValue = function() {
            if (this.selectedObjectsInput) {
                this.selectedObjectsInput.value = this.selectedObjects
            }
        };
        h.SeatingChart.prototype.objectSelected = function(i) {
            this.selectedObjects.push(this.uuidOrLabel(i));
            this.updateSelectedObjectsInputValue()
        };
        h.SeatingChart.prototype.setReservationToken = function(i) {
            this.reservationToken = i;
            this.storage.store("reservationToken", i);
            if (this.reservationTokenInput) {
                this.reservationTokenInput.value = i
            }
        };
        h.SeatingChart.prototype.fetchStoredReservationToken = function() {
            return this.storage.fetch("reservationToken")
        };
        h.SeatingChart.prototype.formatPrices = function(i) {
            var j = {};
            i.forEach(function(k) {
                j[k] = this.config.priceFormatter(k)
            }.bind(this));
            return j
        };
        h.SeatingChart.prototype.uuidOrLabel = function(i) {
            if (this.config.useObjectUuidsInsteadOfLabels) {
                return i.uuid
            }
            return i.label
        };
        h.SeatingChart.prototype.objectDeselected = function(j) {
            for (var k = 0; k < this.selectedObjects.length; ++k) {
                if (this.uuidOrLabel(j) == this.selectedObjects[k]) {
                    this.selectedObjects.splice(k, 1);
                    break
                }
            }
            this.updateSelectedObjectsInputValue()
        };
        h.SeatingChart.prototype.render = function() {
            this.createLoadingDiv();
            this.createIframe("https://app.seats.io/chartRendererIframe.html?chartId=" + this.chartId);
            this.createSelectedObjectsInput();
            this.createReservationTokenInput();
            return this
        };
        h.SeatingChart.prototype.selectBestAvailable = function(i) {
            this.sendMsgToIframe({
                type: "selectBestAvailable",
                bestAvailableConfig: i
            })
        };
        h.SeatingChart.prototype.setUnavailableCategories = function(i) {
            this.sendMsgToIframe({
                type: "setUnavailableCategories",
                unavailableCategories: i
            })
        };
        h.SeatingChart.prototype.changeConfig = function(i) {
            this.sendMsgToIframe({
                type: "changeConfig",
                config: h.SeatingChart.serializeConfig(i)
            })
        };
        h.SeatingChart.prototype.clearSelection = function() {
            this.sendMsgToIframe({
                type: "clearSelection"
            })
        };
        h.SeatingChart.prototype.findObject = function(j, k, i) {
            this.sendMsgToIframe({
                type: "findObject",
                requestId: ++this.requestIdCtr,
                objectUuidOrLabel: j
            });
            this.requestCallbacks[this.requestIdCtr] = k;
            this.requestErrorCallbacks[this.requestIdCtr] = i
        };
        h.SeatingChart.prototype.selectObjects = h.SeatingChart.prototype.selectSeats = function(i) {
            this.sendMsgToIframe({
                type: "selectObjects",
                objectUuidsOrLabels: i
            })
        };
        h.SeatingChart.prototype.deselectObjects = h.SeatingChart.prototype.deselectSeats = function(i) {
            this.sendMsgToIframe({
                type: "deselectObjects",
                objectUuidsOrLabels: i
            })
        };
        h.SeatingChart.prototype.selectCategories = function(i) {
            this.sendMsgToIframe({
                type: "selectCategories",
                ids: i
            })
        };
        h.SeatingChart.prototype.objectFound = function(j, i) {
            if (!this.requestCallbacks[j]) {
                return
            }
            this.requestCallbacks[j](i);
            this.requestCallbacks[j] = undefined
        };
        h.SeatingChart.prototype.objectNotFound = function(i) {
            if (!this.requestErrorCallbacks[i]) {
                return
            }
            this.requestErrorCallbacks[i]();
            this.requestErrorCallbacks[i] = undefined
        };
        h.SeatingChart.serializeConfig = function(i) {
            if (i.tooltipText) {
                i.customTooltipText = true
            }
            if (i.onBestAvailableSelected) {
                i.onBestAvailableSelectedCallbackImplemented = true
            }
            if (i.onBestAvailableSelectionFailed) {
                i.onBestAvailableSelectionFailedCallbackImplemented = true
            }
            if (i.objectColor) {
                i.objectColor = i.objectColor.toString()
            }
            if (i.sectionColor) {
                i.sectionColor = i.sectionColor.toString()
            }
            if (i.objectLabel) {
                i.objectLabel = i.objectLabel.toString()
            }
            if (i.objectIcon) {
                i.objectIcon = i.objectIcon.toString()
            }
            if (i.priceFormatter) {
                i.priceFormatterUsed = true
            }
            if (i.isObjectSelectable) {
                i.isObjectSelectable = i.isObjectSelectable.toString()
            }
            if (i.isObjectVisible) {
                i.isObjectVisible = i.isObjectVisible.toString()
            }
            if (i.objectCategory) {
                i.objectCategory = i.objectCategory.toString()
            }
            if (i.onObjectStatusChanged) {
                i.onObjectStatusChangedCallbackImplemented = true
            }
            return i
        };
        h.SeatingChart.enrichObjectDomain = function(j, i) {
            if (i.objectType !== "section") {
                i.select = function() {
                    j.selectObjects([j.uuidOrLabel(i)])
                };
                i.deselect = function() {
                    j.deselectObjects([j.uuidOrLabel(i)])
                };
                i.seatId = i.id
            }
            i.chart = j;
            return i
        };
        h.SeatingChart.prototype.rendered = function(i) {
            this.iframe.height = i + "px";
            if (this.config.onChartRendered) {
                this.config.onChartRendered(this)
            }
            this.loadingDiv.style.display = "none";
            if (typeof window.callPhantom === "function") {
                window.callPhantom("chartRendered")
            }
            this.isRendered = true
        };
        h.SeatingChart.prototype.messageHandlers = {
            seatsioLoaded: function(k, i, j) {
                i.sendMsgToIframe({
                    type: "render",
                    fitToHeight: i.fitToHeight,
                    configuration: h.SeatingChart.serializeConfig(i.config)
                })
            },
            onChartRendered: function(k, i, j) {
                i.rendered(j.height)
            },
            bookableObjectEvent: function(k, i, j) {
                h.SeatingChart.enrichObjectDomain(i, j.object);
                if (j.subtype == "onObjectSelected") {
                    i.objectSelected(j.object, j.priceLevel)
                } else {
                    if (j.subtype == "onObjectDeselected") {
                        i.objectDeselected(j.object, j.priceLevel)
                    } else {
                        if (j.subtype == "onObjectStatusChanged") {
                            if (!i.isRendered) {
                                return
                            }
                        }
                    }
                }
                if (i.config[j.subtype]) {
                    i.config[j.subtype](j.object, j.priceLevel)
                }
            },
            heightChanged: function(k, i, j) {
                i.iframe.height = j.height + "px"
            },
            dragStarted: function(j, i) {
                i.smoothener = new h.iOSScrollSmoothener()
            },
            dragScrollOutOfBounds: function(k, i, j) {
                var l = i.smoothener.smoothen(j.amount);
                if (i.config.onScrolledOutOfBoundsVertically) {
                    i.config.onScrolledOutOfBoundsVertically(l)
                } else {
                    window.scrollBy(0, l)
                }
            },
            reservationTokenChanged: function(k, i, j) {
                i.setReservationToken(j.token)
            },
            tooltipTextRequested: function(k, i, j) {
                h.SeatingChart.enrichObjectDomain(i, j.object);
                i.sendMsgToIframe({
                    type: "tooltipTextGenerated",
                    text: i.config.tooltipText(j.object)
                })
            },
            onBestAvailableSelected: function(k, i, j) {
                if (i.config.onBestAvailableSelected) {
                    i.config.onBestAvailableSelected(j.seats.map(function(l) {
                        return h.SeatingChart.enrichObjectDomain(i, l)
                    }))
                }
            },
            onBestAvailableSelectionFailed: function(k, i, j) {
                if (i.config.onBestAvailableSelectionFailed) {
                    i.config.onBestAvailableSelectionFailed()
                }
            },
            priceFormattingRequested: function(k, i, j) {
                i.sendMsgToIframe(({
                    type: "pricesFormatted",
                    formattedPrices: i.formatPrices(j.prices)
                }))
            },
            objectFound: function(k, i, j) {
                h.SeatingChart.enrichObjectDomain(i, j.object);
                i.objectFound(j.requestId, j.object)
            },
            objectNotFound: function(k, i, j) {
                i.objectNotFound(j.requestId)
            }
        };
        h.iOSScrollSmoothener = function() {
            this.previousScrollAmount = 0
        };
        h.iOSScrollSmoothener.prototype.smoothen = function(i) {
            if (h.iOSScrollSmoothener.differentSigns(i, this.previousScrollAmount)) {
                this.previousScrollAmount = i;
                return 0
            }
            this.previousScrollAmount = i;
            return i
        };
        h.iOSScrollSmoothener.differentSigns = function(j, i) {
            return j < 0 && i > 0 || j > 0 && i < 0
        };
        h.SeatingChartDesigner = function(i) {
            h.charts.push(this);
            this.chartId = h.CHART_ID++;
            this.init(i);
            this.isRendered = false
        };
        h.SeatingChartDesigner.prototype = new h.Embeddable();
        h.SeatingChartDesigner.prototype.render = function(i) {
            this.renderedCallback = i;
            this.createLoadingDiv();
            this.createIframe("https://app.seats.io/chartDesignerIframe.html?chartId=" + this.chartId);
            this.iframe.scrolling = "yes";
            this.iframe.style.height = "100%";
            this.iframe.style.visibility = "hidden";
            return this
        };
        h.SeatingChartDesigner.prototype.rerender = function() {
            this.isRendered = false;
            this.iframe.remove();
            this.render()
        };
        h.SeatingChartDesigner.prototype.serializeConfig = function() {
            var i = JSON.parse(JSON.stringify(this.config));
            if (this.config.onDoneClicked) {
                i.showDoneButton = true
            }
            return i
        };
        h.SeatingChartDesigner.prototype.messageHandlers = {
            seatsioLoaded: function(j, i) {
                i.sendMsgToIframe({
                    type: "render",
                    configuration: i.serializeConfig()
                })
            },
            seatsioRendered: function(j, i) {
                i.loadingDiv.remove();
                i.iframe.style.visibility = "visible";
                if (i.renderedCallback) {
                    i.renderedCallback()
                }
                if (i.config.onDesignerRendered) {
                    i.config.onDesignerRendered(this)
                }
                i.isRendered = true
            },
            chartCreated: function(k, i, j) {
                i.config.chartKey = j.data
            },
            chartUpdated: function(j, i) {
                if (i.config.onChartUpdated) {
                    i.config.onChartUpdated(i.config.chartKey)
                }
            },
            draftDiscarded: function(j, i) {
                i.config.openDraftDrawing = false;
                i.rerender()
            },
            statusChanged: function(l, j, k) {
                if (j.config.onStatusChanged) {
                    var i = k.data;
                    j.config.onStatusChanged(i, j.config.chartKey)
                }
            },
            doneClicked: function(j, i) {
                if (i.config.onDoneClicked) {
                    i.config.onDoneClicked()
                }
            }
        };
        h.SeatsioSessionStorage = function(i) {
            this.chartId = i
        };
        h.SeatsioSessionStorage.prototype.fetch = function(i) {
            return this.getStoreForChart()[i]
        };
        h.SeatsioSessionStorage.prototype.store = function(j, k) {
            var i = this.getStoreForChart();
            i[j] = k;
            this.setStoreForChart(i)
        };
        h.SeatsioSessionStorage.prototype.getStoreForChart = function() {
            var i = this.getStoreForAllCharts();
            var j = i["chart-" + this.chartId];
            if (!j) {
                return {}
            }
            return j
        };
        h.SeatsioSessionStorage.prototype.setStoreForChart = function(j) {
            var i = this.getStoreForAllCharts();
            i["chart-" + this.chartId] = j;
            this.setStoreForAllCharts(i)
        };
        h.SeatsioSessionStorage.prototype.getStoreForAllCharts = function() {
            var i = sessionStorage.getItem("seatsio");
            if (!i) {
                return {}
            }
            return JSON.parse(i)
        };
        h.SeatsioSessionStorage.prototype.setStoreForAllCharts = function(i) {
            sessionStorage.setItem("seatsio", JSON.stringify(i))
        };
        h.SeatsioSessionStorage.isSupported = function() {
            try {
                sessionStorage.setItem("sessionStorageSupportedTest", "x");
                sessionStorage.removeItem("sessionStorageSupportedTest");
                return true
            } catch (i) {
                if (i.name == "QuotaExceededError") {
                    return false
                }
                throw i
            }
        };
        h.SeatsioDummyStorage = function() {};
        h.SeatsioDummyStorage.prototype.fetch = function(i) {};
        h.SeatsioDummyStorage.prototype.store = function(i, j) {};
        h.SeatsioStorage = {};
        h.SeatsioStorage.create = function(i) {
            if (h.SeatsioSessionStorage.isSupported()) {
                return new h.SeatsioSessionStorage(i)
            }
            h.warn("Session storage not supported; stored data will be lost after page refresh");
            return new h.SeatsioDummyStorage()
        };

        function g(i, j) {
            if (window.addEventListener) {
                window.addEventListener(i, j)
            } else {
                window.attachEvent("on" + i, j)
            }
        }
        g("message", b);
        g("keydown", f);
        g("keyup", f)
    })()
};