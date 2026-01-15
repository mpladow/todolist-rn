import { useTodosQuery } from '@/api';
import { useAddTodoMutation, useCompleteTodoMutation, useDeleteTodoMutation, useOpenTodoMutation } from '@/api/mutations/Todos';
import { ThemedKeyboardAvoidingView } from '@/components/ThemedKeyboardAvoidingView';
import { ThemedText } from '@/components/ThemedText';
import { CustomButton } from '@/components/ui';
import { borderRadius, borderWidth } from '@/constants';
import { useColorScheme } from '@/hooks/useColorScheme.web';
import { TodoDto } from '@/models/todosDto';
import { useState } from 'react';
import { Dimensions, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  // hooks
  const [title, setTitle] = useState('');
  const [editMode, setEditMode] = useState(false);
  const { bottom, top } = useSafeAreaInsets();

  const { data, error, refetch } = useTodosQuery();
  console.log('🚀 ~ HomeScreen ~ data:', data);
  const { mutate: addTodo } = useAddTodoMutation();
  const { mutate: deleteTodo } = useDeleteTodoMutation();
  const { mutate: completeTodo } = useCompleteTodoMutation();
  const { mutate: openTodo } = useOpenTodoMutation();

  const theme = useColorScheme();

  // handlers
  const handleAddNew = () => {
    if (!title.trim()) {
      return; // Don't add empty todos
    }

    const newTodo: TodoDto = {
      title: title.trim(),
    };
    addTodo(newTodo);
    setTitle(''); // Clear the input after adding
    Keyboard.dismiss();
  };

  const handlePressCheckbox = (id: number) => {
    const foundItem = data?.find((x) => x.todoId === id);
    if (foundItem?.completedAt) {
      openTodo(id);
    } else {
      completeTodo(id);
    }
  };

  const handleDelete = (id?: number) => {
    if (id) {
      deleteTodo(id);
    }
  };

  return (
    <ThemedKeyboardAvoidingView style={[styles.container, { marginTop: top }]}>
      {/* Header with Todo List title and Edit Mode button */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 4 }}>
        <View style={{ flex: 1 }}>
          <ThemedText>ToDo List</ThemedText>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          {data.length > 0 && (
            <CustomButton
              label={editMode ? 'Editing' : 'Edit Mode'}
              buttonType={'primary'}
              buttonSize={'small'}
              onPress={() => {
                setEditMode(!editMode);
              }}
            />
          )}
        </View>
      </View>

      {/* API Connection Error Alert */}
      {error && (
        <View style={[styles.alertBox, { backgroundColor: theme === 'dark' ? '#8B0000' : '#FFE4E1' }]}>
          <View style={styles.alertContent}>
            <Text style={[styles.alertIcon, { color: theme === 'dark' ? '#FF6B6B' : '#DC143C' }]}>⚠️</Text>
            <View style={styles.alertTextContainer}>
              <Text style={[styles.alertTitle, { color: theme === 'dark' ? '#FF6B6B' : '#DC143C' }]}>Connection Error</Text>
              <Text style={[styles.alertMessage, { color: theme === 'dark' ? '#FFB3B3' : '#8B0000' }]}>
                Unable to reach API. Working offline. Changes will sync when connection is restored.
              </Text>
            </View>
          </View>
        </View>
      )}

      <Animated.FlatList
        entering={Platform.OS == 'web' ? undefined : FadeInUp}
        data={data}
        contentContainerStyle={{ height: Dimensions.get('screen').height - 100, flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        scrollEnabled
        renderItem={({ item, index }) => {
          return (
            <Animated.View
              entering={Platform.OS == 'web' ? undefined : FadeInDown}
              exiting={Platform.OS == 'web' ? undefined : FadeOutLeft}
              style={{ padding: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Pressable
                  hitSlop={10}
                  onPress={() => handlePressCheckbox(item?.todoId ?? 0)}
                  style={[
                    styles.checkbox,
                    {
                      borderColor: theme == 'dark' ? 'white' : 'black',
                      backgroundColor: item.completedAt ? (theme == 'dark' ? 'white' : 'black') : 'transparent',
                    },
                  ]}>
                  {item.completedAt && (
                    <Text style={{ color: theme == 'dark' ? 'black' : 'white', textAlign: 'center', fontSize: 16 }}>✓</Text>
                  )}
                </Pressable>
					 
                <ThemedText
                  style={{
                    textDecorationLine: item.completedAt ? 'line-through' : 'none',
                    opacity: item.completedAt ? 0.6 : 1,
                  }}>
                  {item.title}
                </ThemedText>
              </View>
              {editMode && (
                <CustomButton
                  hitSlop={10}
                  onPress={() => handleDelete(item?.todoId)}
                  label={'Delete'}
                  buttonType={'danger'}
                  buttonSize={'small'}
                />
              )}
            </Animated.View>
          );
        }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 4 }}>
        <View style={{ flex: 1 }}>
          <TextInput
            style={{
              padding: 8,
              borderWidth: 1,
              borderColor: theme === 'dark' ? 'white' : 'black',
              color: theme === 'dark' ? 'white' : 'black',
              backgroundColor: theme === 'dark' ? '#333' : '#fff',
              borderRadius: 4,
            }}
            value={title}
            onChangeText={(val) => setTitle(val)}
            placeholder={'Enter a todo item'}
            placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
          />
        </View>
        <View>
          <Pressable
            onPress={handleAddNew}
            style={[
              {
                width: 60,
                padding: 8,
                borderRadius: 4,
                backgroundColor: '#007AFF',
              },
            ]}>
            <Text style={{ color: 'white', textAlign: 'center' }}>Add</Text>
          </Pressable>
        </View>
      </View>
    </ThemedKeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    height: Dimensions.get('screen').height - 200,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  checkbox: {
    borderRadius: borderRadius,
    borderWidth: borderWidth,
    borderColor: 'black',
    marginRight: 8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    marginVertical: 8,
    marginHorizontal: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DC143C',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 8,
    marginTop: 2,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 12,
    lineHeight: 16,
  },
});
