<template>
    <div class="p-col-12">
        <div class="card">
            <h4>{{ $t("common.welcome") }}, {{ loginedUser.fullName }} !</h4>
        </div>
        <div class="card">
            <TabView ref="templateView" v-model:activeIndex="active" class="p-p-0">
                <TabPanel v-bind:header="$t('smartenu.newsTitle')" class="p-p-0">
                    <div class="post" :key="p.id" v-for="p of posts">
                        <img src="https://enu.kz/pictures/iyul-2020/o-karantine.jpg" alt="">
                        <div class="text"><strong>Title: {{p.title}}</strong>
                            <p>{{p.description}}</p></div>
                    </div>
                </TabPanel>
                <TabPanel v-bind:header="$t('smartenu.eventsTitle')" class="p-p-0">
                </TabPanel>
            </TabView>
        </div>
    </div>
</template>

<script>
    import {mapState} from "vuex";

    export default {
        name: "Welcome",
        data() {
            return {
                posts: [
                    {
                        id: 1,
                        title: "New Post",
                        description: "Description description description description description"
                    },
                    {
                        id: 2,
                        title: "New Post 2",
                        description: "Description description description description description 222"
                    },
                    {
                        id: 3,
                        title: "New Post 3",
                        description: "Description description description description description 333"
                    }
                ],
                title: "",
                description: ""
            };
        },
        computed: {
            ...mapState(["loginedUser"]),
        },
    }
</script>

<style lang="scss" scoped>
    .post {
        display: flex;
        margin: 15px 0;
        width: 80%;
        border-radius: 5px;
        box-shadow: 1px 1px 3px 0;

        .text {
            margin-left: 10px;
            padding: 20px;
        }

        img {
            width: 120px;
            border-bottom-left-radius: 5px;
            border-top-left-radius: 5px;
        }
    }
</style>
