    import api from '@/service/api';

export default class EventService {

    getEvents() {

        return api.get('assets/layout/data/events.json').then(res => res.data.data);
    }
}
    