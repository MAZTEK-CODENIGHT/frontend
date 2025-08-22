import { StyleSheet } from 'react-native';
export default StyleSheet.create({
  container: {
    padding: 12,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  pickerTitle: {
    fontWeight: '500',
    fontSize: 16,
  },
  inputContainer: {
    gap: 8,
  },
  phoneNumber: {
    color: 'rgba(0,0,0,0.5)',
    fontWeight: '600',
    fontSize: 16,
  },
  selectDateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  selectDateButton: {
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputsContainer: {
    gap: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#059669',
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: '#7c3aed',
    flex: 1,
  },
});
