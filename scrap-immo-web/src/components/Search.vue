<template>
    <div class="hello">
        <zips v-model="criteria.zipCodes" @change="criteriaChanged"/>

        <v-container>
            <v-layout row>
                <v-text-field
                        label="Minimal price"
                        :hide-details="true"
                        v-model="criteria.priceMin"
                        @keypress.enter="criteriaChanged"
                />

                <v-text-field
                        label="Maximal price"
                        :hide-details="true"
                        v-model="criteria.priceMax"
                        @keypress.enter="criteriaChanged"
                />

                <v-text-field
                        label="Minimal size"
                        :hide-details="true"
                        v-model="criteria.sizeMin"
                        @keypress.enter="criteriaChanged"
                />

                <v-text-field
                        label="Maximal size"
                        :hide-details="true"
                        v-model="criteria.sizeMax"
                        @keypress.enter="criteriaChanged"
                />
            </v-layout>
        </v-container>

        <v-container class="filter">
            <v-layout row>
                <v-radio-group v-model="filter.category" :hide-details="true" :row="true" class="radio-group-bla">
                    <v-radio :label="'All (' + all.length + ')'" value="all"/>
                    <v-radio :label="'Relevants (' + relevants.length + ')'" value="relevant"/>
                    <v-radio :label="'News (' + news.length + ')'" value="new"/>
                    <v-radio :label="'Favorites (' + favorites.length + ')'" value="favorite"/>
                    <v-radio :label="'Ignored (' + ignores.length + ')'" value="ignored"/>
                </v-radio-group>

                <v-icon @click="loadAnnounces" class="refresh">refresh</v-icon>
            </v-layout>
        </v-container>

        <div class="ads">
            <v-alert :value="true" :type="alertType">
                <v-progress-circular indeterminate color="primary" v-show="loading"></v-progress-circular>
                <span v-if="alertType === 'error'">Failed</span>
                <span v-else-if="filtredAds.length === 0 && !loading">No results.</span>
                <span v-else-if="!loading">{{ filtredAds.length }} items</span>
            </v-alert>

            <v-tabs v-model="activeGroup" v-show="filtredAds.length > 0">
                <v-tab
                        v-for="(value, key) in grouped"
                        :key="key"
                        ripple>
                    {{ key }} ({{ value.length }})
                </v-tab>

                <v-tab-item
                        v-for="(value, key) in grouped"
                        :key="key" >
                    <announce v-for="item in value" :key="item.id" :ad="item" @adChanged="adChanged()"/>
                </v-tab-item>
            </v-tabs>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';
    import {groupBy} from 'lodash';
    // import sample from '../../samples/search';
    import Announce from './Announce';
    import Zips from './Zips';

    const API_URL = process.env.API_URL;

    export default {
        components: {Zips, Announce},

        data() {
            const _criteria = window.localStorage.getItem('criteria')
            const criteria = _criteria ? JSON.parse(_criteria) : {
                zipCodes: ['75013', '75014'],
                priceMin: 400000,
                priceMax: 550000,
                sizeMin: 40,
                sizeMax: null
            }

            return {
                items: [],
                loading: false,
                filter: {
                    category: 'relevant'
                },
                activeGroup: null,
                alertType: 'info',
                criteria,
                zips: ['75013', '75014'],
                bla: []
            }
        },

        async created() {
            this.loadAnnounces()
        },

        computed: {
            filtredAds() {
                if (this.filter.category === 'all') {
                    return this.all;
                }

                if (this.filter.category === 'relevant') {
                    return this.relevants;
                }

                if (this.filter.category === 'new') {
                    return this.news;
                }

                if (this.filter.category === 'favorite') {
                    return this.favorites;
                }

                if (this.filter.category === 'ignored') {
                    return this.ignores;
                }
            },

            all() {
                return this.items;
            },

            relevants() {
                return this.items.filter(ad => !ad.data.ignore);
            },

            news() {
                return this.items.filter(ad => ad.data.new);
            },

            favorites() {
                return this.items.filter(ad => ad.data.favorite);
            },

            ignores() {
                return this.items.filter(ad => ad.data.ignore);
            },

            grouped() {
                return groupBy(this.filtredAds, announce => announce.zip);
            }
        },

        methods: {
            async loadAnnounces() {
                this.loading = true
                this.alertType = 'info'

                try {
                    const response = await axios.get(API_URL + '/ads', {
                        params: {
                            ...this.criteria,
                            zipCodes: this.criteria.zipCodes.join(','),
                        }
                    });

                    this.items = response.data;

                    this.$nextTick(() => {
                        document.querySelector('.tabs__item').click()
                    })
                } catch (e) {
                    console.error('Error during load announces', e)
                    this.alertType = 'error'
                } finally {
                    this.loading = false;
                }
            },

            adChanged() {
                this.items = [...this.items]
            },

            saveCriteria() {
                window.localStorage.setItem('criteria', JSON.stringify(this.criteria))
            },

            criteriaChanged() {
                this.saveCriteria()
                this.loadAnnounces()
            }
        }
    }
</script>

<style lang="scss">
    @import '../scss/variable';

    $content-with: 1240px;

    .refresh {
        cursor: pointer;
    }

    .filter {
        background-color: #efefef;
        border-radius: 10px;
        max-width: $content-with;

        .radio-group {
            padding: 0;
        }
    }

    .ads {
        margin: auto;
        display: block;
        text-align: center;
        max-width: $content-with;

        > .info {
            margin: 10px 0;
        }
    }

    .radio-group {
        > .input-group__input {
            flex-direction: row !important;
        }

        > .input-group__input > .radio.input-group {
            flex-direction: row !important;
        }
    }

    @media screen and (max-width: $mobile-width) {
        .radio-group {
            > .input-group__input {
                flex-direction: column !important;
            }

            > .input-group__input > .radio.input-group {
                flex-direction: column !important;;
            }
        }
    }
</style>
