import { Photographer } from './photographer.model';

describe('Photographer', () => {
  it('should create an instance', () => {
    const photographer = new Photographer(
      'AWS-001',
      'hello@gmail.com',
      'Family Name',
      'Given Name',
      'Name',
      'STR-001',
     100,
     200,
     20.0,
     20.0,
      '4 Allée Montaury',
      '64600',
      'Anglet',
      'France',
      '564-1584',
      'mdp',
   );
   expect(photographer).toBeTruthy();
 });
});
